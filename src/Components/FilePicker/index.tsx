import RX = require('reactxp')
import { map } from 'lodash'
import { CallToAction, Icons } from '../../Components'
import * as Theme from '../../Theme'

interface Props extends RX.CommonProps {
  onChange?: (files: any[]) => void
  inProgress?: boolean
  title?: string
}

class FilePicker extends RX.Component<Props, null> {

  private _inputElement: any

  constructor(props: Props) {
    super(props)
    this.showImagePicker = this.showImagePicker.bind(this)
    this.handleFiles = this.handleFiles.bind(this)
    this._onInputRef = this._onInputRef.bind(this)
    this._inputElement = null
  }

  _onInputRef(element: any) {
    this._inputElement = element
  }

  showImagePicker() {
    this._inputElement.click()
  }

  readFile(file: any) {
    return new Promise((resolve, reject) => {
      var reader = new FileReader()
      reader.onload = function(evt: any) {
        resolve(evt.target.result)
      }
      reader.readAsText(file)
    })
  }

  handleFiles(e: any) {
    const promises = map(e.target.files, (file: any) => this.readFile(file))
    Promise.all(promises).then((fileData: any) => {
      const result = map(fileData, (item, key) => ({contents: item}))
      this.props.onChange(result)
    })

  }

  render() {
    return (
      <RX.View >
        <input
          type='file'
          ref={this._onInputRef}
          style={{display: 'none'}}
          onChange={this.handleFiles}
        />
        <CallToAction
          title={this.props.title}
          type={CallToAction.type.Main}
          onPress={this.showImagePicker}
          />
      </RX.View>
    )
  }
}

export default FilePicker
