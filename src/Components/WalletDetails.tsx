import RX = require('reactxp')
import * as Theme from '../Theme'
import { ListItem, CallToAction, AccountIcon } from '../Components'
import * as Enums from '../Enums'
import Utils from '../Utils'

interface Props extends RX.CommonProps {
  startLogin?: () => void
  navigate?: (routeName: string) => void
  routeName: string,
  currentUser?: User
  selectedToken?: string
  balances?: Balance[]
  handleSelectToken: (token: Token) => void
  uiTraits?: UITraits
}

export default class WalletDetails extends RX.Component<Props, null> {

  render() {
    return (
      <RX.View style={Theme.Styles.container}>
        {this.props.currentUser && <RX.View style={Theme.Styles.accountInfo.wrapper}>
          <AccountIcon
            account={this.props.currentUser}
            type={AccountIcon.type.Large}
            />
          <RX.Text style={Theme.Styles.accountInfo.title}>
            {this.props.currentUser.name}
          </RX.Text>
          {this.props.currentUser.address !== this.props.currentUser.name && <RX.Text style={Theme.Styles.accountInfo.subTitle}>
            {Utils.address.short(this.props.currentUser.address)}  {Utils.address.mnidToNetworkName(this.props.currentUser.mnid)}
          </RX.Text>}
        </RX.View>}

        {this.props.balances.length === 0 && <RX.View style={Theme.Styles.infoBox.wrapper}>
            {/* {RX.Platform.getType() === 'web' && <RX.Text style={Theme.Styles.about.warning}>
              No Web3 provider detected. Please use Metamask, Parity, Cipher or:
            </RX.Text>} */}
            <CallToAction
              type={CallToAction.type.Main}
              title='Login with uPort (Rinkeby)'
              onPress={this.props.startLogin}
            />

            {/* <CallToAction
              type={CallToAction.type.Main}
              title='Login with uPort (Mainnet)'
              onPress={this.props.startLoginMainnet}
            />
            <RX.Text style={Theme.Styles.about.warning}>
              Transactions on Mainnet must be funded by you
            </RX.Text> */}
          </RX.View>}
        {this.props.balances.length > 0 && <RX.View>

            {this.props.balances.map((account, key) => {
              return <ListItem
                key={key}
                account={account.token}
                title={`${account.token.name}`}
                subTitle={`${Utils.number.numberToString(account.amount, account.token.decimals)} ${account.token.code}`}
                type={ListItem.type.Default}
                selected={!this.props.uiTraits.horizontalIsCompact && this.props.routeName !== 'TokensForm' && this.props.selectedToken
                  && account.token.address === this.props.selectedToken}
                onPress={() => this.props.handleSelectToken(account.token)}
              />
            })}

            <CallToAction
              padded
              type={CallToAction.type.Main}
              title={'Add token'}
              onPress={() => {
                this.props.navigate('TokensForm')
              }}
              disabled={this.props.routeName === 'TokensForm'}
              />

          </RX.View>}

    </RX.View>
    )
  }
}
