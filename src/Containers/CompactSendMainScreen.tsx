import RX = require('reactxp')
import { connect } from 'react-redux'
import { CallToAction, SendDetails, ScrollView } from '../Components'
import { CombinedState } from '../Reducers'
import Actions from '../Reducers/Actions'
import * as Selectors from '../Selectors'
import * as Theme from '../Theme'
import * as Enums from '../Enums'
import utils from '../Utils'

interface Props extends RX.CommonProps {
  navigate?: (routeName: string) => void
  navigateHome?: () => void
  navigation?: any,
  currentUser?: User,
  transaction?: Transaction,
  isProcessing?: boolean
  send?: () => void
  request?: () => void
  uiTraits?: UITraits
  startLogin?: () => void
  receiver?: User
  sender?: User
  amount?: string
  token?: Token
  attachment?: Attachment
  room?: MatrixRoom
  isSend?: boolean
  setIsSend?: (isSend: boolean) => void
  setModalMessage?: (config: ModalMessageConfig) => void
}

class CompactSendMasterScreen extends RX.Component<Props, null> {
  render() {
    return (
      <RX.View style={Theme.Styles.scrollContainerNoMargins}>
        <ScrollView>

          <SendDetails
              navigate={this.props.navigate}
              startLogin={this.props.startLogin}
              send={this.props.send}
              request={this.props.request}
              isProcessing={this.props.isProcessing}
              routeName={''}
              sender={this.props.sender}
              receiver={this.props.receiver}
              amount={this.props.amount}
              token={this.props.token}
              attachment={this.props.attachment}
              room={this.props.room}
              setModalMessage={this.props.setModalMessage}
              isSend={this.props.isSend}
              setIsSend={this.props.setIsSend}
              currentUser={this.props.currentUser}
              />

        </ScrollView>
      </RX.View>
    )
  }
}
const styles = {
  cta: RX.Styles.createViewStyle({
    marginTop: Theme.Metrics.baseMargin,
  }),
}
const mapStateToProps = (state: CombinedState): Props => {
  return {
    currentUser: Selectors.Contacts.getAccountByDid(state, state.user.current.did),
    transaction: state.transactions.new,
    amount: state.transactions.new.amount,
    attachment: Selectors.Attachment.getNew(state),
    isSend: Selectors.Transactions.getIsSend(state),
    token: Selectors.Tokens.getTokenByAddress(state, state.transactions.new.token),
    receiver: Selectors.Contacts.getAccountByAddress(state, state.transactions.new.receiver),
    sender: Selectors.Contacts.getAccountByAddress(state, state.transactions.new.sender),
    isProcessing: Selectors.Process.isRunningProcess(state, Enums.ProcessType.SendTransaction),
    room: Selectors.Matrix.getRoomById(state, state.transactions.new.room),
    uiTraits: state.app.uiTraits,
  }
}
const mapDispatchToProps = (dispatch: any): Props => {
  return {
    navigate: (routeName: string) => dispatch(Actions.Navigation.navigate(routeName)),
    navigateHome: () => dispatch(Actions.Navigation.navigateHome()),
    send: () => dispatch(Actions.Transactions.startSaving()),
    request: () => dispatch(Actions.Transactions.requestInMatrix()),
    startLogin: () => dispatch(Actions.User.startLogin()),
    setIsSend: (isSend: boolean) => dispatch(Actions.Transactions.setIsSend(isSend)),
    setModalMessage: (config: ModalMessageConfig) => dispatch(Actions.ModalMessage.setModalMessage(config)),
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CompactSendMasterScreen)
