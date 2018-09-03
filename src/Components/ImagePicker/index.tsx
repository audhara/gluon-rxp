import RX = require('reactxp')
import { map } from 'lodash'
import { CallToAction, Icons } from '../../Components'
import * as Theme from '../../Theme'

interface Props extends RX.CommonProps {
  onChange?: (files: ImagePickerFile[]) => void
  inProgress?: boolean
}

class ImagePicker extends RX.Component<Props, null> {

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
      reader.readAsDataURL(file)
    })
  }

  handleFiles(e: any) {
    const promises = map(e.target.files, (file: any) => this.readFile(file))
    const file = e.target.files[0]
    Promise.all(promises).then((fileData: any) => {
      const result = map(fileData, (item, key) => ({dataUrl: item, file}))
      this.props.onChange(result)
    })

  }

  render() {
    return (
      <RX.View style={{flex: 1, backgroundColor: Theme.Colors.backgroundSelected,
        height: 84, justifyContent: 'center', alignItems: 'center'}}>
        <input
          type='file'
          ref={this._onInputRef}
          style={{display: 'none'}}
          accept='image/*'
          onChange={this.handleFiles}
        />
        <RX.Button
          onPress={this.showImagePicker}
          >
            <Icons.PhotoIcon />
          </RX.Button>
      </RX.View>
    )
  }
}

export default ImagePicker
