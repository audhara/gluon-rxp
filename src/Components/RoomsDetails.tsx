import RX = require('reactxp')
import * as Theme from '../Theme'
import { ListItem, AccountIcon, MatrixLogin, CallToAction } from '../Components'
import { filter } from 'lodash'
interface Props extends RX.CommonProps {
  startLogin?: () => void
  navigate?: (routeName: string) => void
  routeName: string,
  currentUser?: User
  selectedRoomId?: string
  rooms?: MatrixRoom[]
  currentMatrixUser?: MatrixUser
  handleSelectRoom: (roomId: String) => void
  uiTraits?: UITraits
  matrixLogin?: (username: string, password: string, baseUrl: string) => void
  isLoggingIn?: boolean
  matrixRegister?: (username: string, password: string, baseUrl: string) => void
  isRegistering?: boolean
  isSyncing?: boolean
}

const lastMessage = (room: MatrixRoom): string => {
  if (!room) {
    return ''
  }
  const message = filter(room.timeline,
    (event: MatrixTimelineEvent) => event.type === 'm.room.message' &&
    event.content && event.content.body && event.content.body.length > 0).pop()
  return message ? message.content.body.substr(0, 40) : `${room.members.length} Members`
}

export default class RoomsDetails extends RX.Component<Props, null> {

  render() {
    return (
      <RX.View style={Theme.Styles.container}>
        {this.props.currentMatrixUser && this.props.currentUser && <RX.View style={Theme.Styles.accountInfo.wrapper}>
          <AccountIcon
            account={this.props.currentUser}
            type={AccountIcon.type.Large}
            />
          <RX.Text style={Theme.Styles.accountInfo.title}>
            {this.props.currentUser.name}
          </RX.Text>
          <RX.Text style={Theme.Styles.accountInfo.subTitle}>
            {this.props.currentMatrixUser.user_id}
          </RX.Text>
        </RX.View>}
        {!this.props.currentMatrixUser && <MatrixLogin
          login={this.props.matrixLogin}
          register={this.props.matrixRegister}
          isLoggingIn={this.props.isLoggingIn}
          isRegistering={this.props.isRegistering}
          />}

        {this.props.rooms.length > 0 && <RX.View>
            {/* <ListItem
              key='new'
              isOff
              title={`New room`}
              subTitle={`Create or join existing`}
              type={ListItem.type.Default}
              selected={this.props.routeName === 'NewRoomForm'}
            /> */}
            {this.props.rooms.map((room, key) => {
              return <ListItem
                key={key}
                account={{avatar: room.avatarUrl}}
                title={`${room.name}`}
                subTitle={lastMessage(room)}
                type={ListItem.type.Default}
                selected={!this.props.uiTraits.horizontalIsCompact && this.props.routeName !== 'RoomNewForm' && this.props.selectedRoomId
                  && room.id === this.props.selectedRoomId}
                onPress={() => this.props.handleSelectRoom(room.id)}
              />
            })}
          </RX.View>}
          {this.props.isSyncing && <RX.ActivityIndicator size='medium' color='white'/> }

          <RX.View style={{marginTop: Theme.Metrics.baseMargin}}/>

          <CallToAction
            type={CallToAction.type.Main}
            title={'New Room'}
            onPress={() => this.props.navigate('RoomNewForm')}
            disabled={this.props.routeName === 'RoomNewForm'}
          />

    </RX.View>
    )
  }
}
