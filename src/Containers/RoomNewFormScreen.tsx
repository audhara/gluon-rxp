import RX = require('reactxp')
import { connect } from 'react-redux'
import { CallToAction, ScrollView, ListItem, TextInput, SegmentedControl, AccountIcon, ImagePicker } from '../Components'
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
  createRoom?: (options: MatrixNewRoomOptions) => void
  isCreatingNewRoom?: boolean
  matrixContacts?: VerifiableClaim[]
}

interface State {
  isNew?: boolean,
  roomName?: string,
  roomAddress?: string,
  selectedMatrixIds?: string[],
  matrixId?: string,
  avatarDataUrl?: any,
  avatarFile?: any,
}

class RoomNewFormScreen extends RX.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      isNew: true,
      roomName: '',
      roomAddress: '',
      matrixId: '',
      selectedMatrixIds: [],
      avatarDataUrl: '',
      avatarFile: null,
    }
  }

  private handleCreate = () => {
    let manualIds: string[] = []
    if (this.state.matrixId) {
      manualIds = this.state.matrixId.split(',')
    }
    this.props.createRoom({
      name: this.state.roomName,
      visibility: 'private',
      invite: [...this.state.selectedMatrixIds, ...manualIds],
      file: this.state.avatarFile,
    })
  }

  private isValidNewRoom = () => {
    return this.state.roomName !== ''
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
    this.setState({avatarDataUrl: data[0].dataUrl, avatarFile: data[0].file})
  }

  render() {
    return (
      <RX.View style={Theme.Styles.scrollContainerNoMargins}>
        <ScrollView>
          {/* <SegmentedControl
              titles={['Create room', 'Join existing']}
              selectedIndex={this.state.isNew ? 0 : 1}
              handleSelection={(index) => this.setState({isNew: index === 0 ? true : false})}
              /> */}
          {this.state.isNew && <RX.View>
            <RX.View style={{flexDirection: 'row', justifyContent: 'center', marginTop: Theme.Metrics.baseMargin}}>
              <RX.Image source={this.state.avatarDataUrl}
                style={[Theme.Styles.accountIconLarge]}
                resizeMode={'cover'}
                >
                <ImagePicker
                  onChange={this.handleImageChange}
                  />
              </RX.Image>
            </RX.View>
            <TextInput
            label='Room name'
            value={this.state.roomName}
            placeholder={'Enter room name'}
            onChangeText={(value) => this.setState({ roomName: value })}
            />
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
              title={'Create new room'}
              onPress={this.handleCreate}
              disabled={!this.isValidNewRoom()}
              inProgress={this.props.isCreatingNewRoom}
            />
          </RX.View>}

        </ScrollView>
      </RX.View>
    )
  }
}

const mapStateToProps = (state: CombinedState): Props => {
  return {
    isCreatingNewRoom: Selectors.Process.isRunningProcess(state, Enums.ProcessType.MatrixCreateRoom),
    matrixContacts: Selectors.Contacts.getMatrixContacts(state),
  }
}
const mapDispatchToProps = (dispatch: any): Props => {
  return {
    navigateBack: () => dispatch(Actions.Navigation.navigateBack()),
    navigate: (routeName: string) => dispatch(Actions.Navigation.navigate(routeName)),
    createRoom: (options: MatrixNewRoomOptions) => dispatch(Actions.Matrix.createRoom(options)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(RoomNewFormScreen)
