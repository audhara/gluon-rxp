import RX = require('reactxp')
import { connect } from 'react-redux'
import { CallToAction, ScrollView, ListItem, TextInput, SegmentedControl, ImagePicker, AccountIcon } from '../Components'
import { CombinedState } from '../Reducers'
import Actions from '../Reducers/Actions'
import * as Selectors from '../Selectors'
import * as Theme from '../Theme'
import * as Enums from '../Enums'
import * as S from 'string'
import utils from '../Utils'
import * as _ from 'lodash'

interface Props extends RX.CommonProps {
  navigate?: (routeName: string) => void
  navigateBack?: () => void
  leaveRoom?: (roomId: string) => void
  invite?: (roomId: string, userIds: string[]) => void
  setRoomName?: (roomId: string, name: string) => void
  setRoomAvatar?: (roomId: string, file: any) => void
  matrixContacts?: VerifiableClaim[]
  room?: MatrixRoom
  isInviting?: boolean,
  isLeaving?: boolean,
  isSettingName?: boolean,
  isSettingAvatar?: boolean,
}

interface State {
  selectedMatrixIds?: string[]
  matrixId?: string,
  roomName?: string,
}

class RoomNewFormScreen extends RX.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      selectedMatrixIds: [],
      matrixId: '',
      roomName: props.room.name,
    }
  }

  private handleSetRoomName = () => {
    this.props.setRoomName(this.props.room.id, this.state.roomName)
  }

  private handleLeave = () => {
    this.props.leaveRoom(this.props.room.id)
  }

  private handleInvite = () => {
    let manualIds: string[] = []
    if (this.state.matrixId) {
      manualIds = this.state.matrixId.split(',')
    }
    this.props.invite(this.props.room.id, [...this.state.selectedMatrixIds, ...manualIds])
  }

  private toggleSelectedMatrixId = (matrixId: string) => {
    if (_.includes(this.state.selectedMatrixIds, matrixId)) {
      this.setState({selectedMatrixIds: _.without(this.state.selectedMatrixIds, matrixId)})
    } else {
      const selectedMatrixIds =  this.state.selectedMatrixIds
      selectedMatrixIds.push(matrixId)
      this.setState({selectedMatrixIds})
    }
  }

  private handleImageChange = (data: any) => {
    this.props.setRoomAvatar(this.props.room.id, data[0].file)
  }

  private isValid = () => {
    return this.state.selectedMatrixIds.length > 0 || this.state.matrixId !== ''
  }

  render() {
    return (
      <RX.View style={Theme.Styles.scrollContainerNoMargins}>
        <ScrollView>
            <RX.View style={{flexDirection: 'row', justifyContent: 'center', marginTop: Theme.Metrics.baseMargin}}>
              <AccountIcon type={AccountIcon.type.Large}
                account={{avatar: this.props.room.avatarUrl}}>
                <ImagePicker
                  onChange={this.handleImageChange}
                  inProgress={this.props.isSettingAvatar}
                  />
              </AccountIcon>
            </RX.View>

            <TextInput
              label='Room name'
              value={this.state.roomName}
              placeholder={'Enter Room name'}
              onChangeText={(value) => this.setState({ roomName: value })}
              />
            {this.state.roomName !== this.props.room.name && <CallToAction
              padded
              type={CallToAction.type.Main}
              title={'Save'}
              onPress={this.handleSetRoomName}
              inProgress={this.props.isSettingName}
            />}

            <RX.View style={Theme.Styles.sectionTitleWrapper}>
              <RX.Text style={Theme.Styles.sectionTitleLabel}>Members</RX.Text>
            </RX.View>
            {this.props.room.members.map((member: MatrixMember, key) => {
              return <ListItem
                key={key}
                account={{avatar: member.avatarUrl}}
                title={member.displayname}
                subTitle={member.userId}
                type={ListItem.type.Secondary}
              />
            })}

            <RX.View style={Theme.Styles.sectionTitleWrapper}>
              <RX.Text style={Theme.Styles.sectionTitleLabel}>Invite</RX.Text>
            </RX.View>
            {this.props.matrixContacts.map((claim: VerifiableClaim, key) => {
              return <ListItem
                key={key}
                account={claim.subject}
                title={`${claim.subject.name}`}
                subTitle={claim.claimValue}
                type={ListItem.type.Secondary}
                selected={_.includes(this.state.selectedMatrixIds, claim.claimValue)}
                onPress={() => this.toggleSelectedMatrixId(claim.claimValue)}
                isRadioButton
              />
            })}

            <TextInput
              label='Invite with Matrix ID (optional)'
              value={this.state.matrixId}
              placeholder={'Enter Matrix ID'}
              onChangeText={(value) => this.setState({ matrixId: value })}
              />

            <RX.View style={{marginTop: Theme.Metrics.baseMargin * 2}}/>

            <CallToAction
              type={CallToAction.type.Main}
              title={'Invite contacts'}
              onPress={this.handleInvite}
              disabled={!this.isValid()}
              inProgress={this.props.isInviting}
            />

            <CallToAction
              type={CallToAction.type.Secondary}
              title={'Leave room'}
              onPress={this.handleLeave}
              inProgress={this.props.isLeaving}
            />

        </ScrollView>
      </RX.View>
    )
  }
}

const mapStateToProps = (state: CombinedState): Props => {
  const room = Selectors.Matrix.getSelectedRoom(state)
  const members = room.members.map((member: MatrixMember) => member.userId)

  const matrixContacts = Selectors.Contacts.getMatrixContacts(state)
  const filteredContacts = _.filter(matrixContacts, (contact: VerifiableClaim) => !_.includes(members, contact.claimValue))
  return {
    room: room,
    matrixContacts: filteredContacts,
    isInviting: Selectors.Process.isRunningProcess(state, Enums.ProcessType.MatrixInviteContacts),
    isLeaving: Selectors.Process.isRunningProcess(state, Enums.ProcessType.MatrixLeaveRoom),
    isSettingName: Selectors.Process.isRunningProcess(state, Enums.ProcessType.MatrixSetRoomName),
    isSettingAvatar: Selectors.Process.isRunningProcess(state, Enums.ProcessType.MatrixSetRoomAvatar),
  }
}
const mapDispatchToProps = (dispatch: any): Props => {
  return {
    navigateBack: () => dispatch(Actions.Navigation.navigateBack()),
    navigate: (routeName: string) => dispatch(Actions.Navigation.navigate(routeName)),
    leaveRoom: (roomId: string) => dispatch(Actions.Matrix.leaveRoom(roomId)),
    invite: (roomId: string, userIds: string[]) => dispatch(Actions.Matrix.inviteToRoom({roomId, userIds})),
    setRoomName: (roomId: string, name: string) => dispatch(Actions.Matrix.setRoomName({roomId, name})),
    setRoomAvatar: (roomId: string, file: string) => dispatch(Actions.Matrix.setRoomAvatar({roomId, file})),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(RoomNewFormScreen)
