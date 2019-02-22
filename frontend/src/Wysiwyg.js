import React from 'react'
import logger from './logger'
import scriptjs from 'scriptjs'
import { CKEDITOR_PATH } from './constants'

class Wysiwyg extends React.Component {
  static defaultProps = {
    onChange: () => {},
    data: '',
    setCkeditorRef: () => {}
  }

  editor = null

  editorRef = React.createRef()

  componentDidUpdate (prevProps) {
    if (this.editor && prevProps.data !== this.props.data) {
      this.editor.setData(this.props.data)
    }
  }

  async componentDidMount () {
    try {
      if (!window.CKEDITOR) {
        await new Promise((resolve, reject) => scriptjs.get(
          `${CKEDITOR_PATH}/ckeditor/ckeditor.js`
          , resolve
          , reject
        ))
      }

      if (window.CKEDITOR) {
        this.editor = window.CKEDITOR.replace(this.editorRef.current, {
          toolbarGroups: [
            { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
            { name: 'editing', groups: [ 'find', 'selection', 'spellchecker', 'editing' ] },
            { name: 'forms', groups: [ 'forms' ] },
            { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
            { name: 'insert', groups: [ 'insert' ] },
            { name: 'links', groups: [ 'links' ] },
            '/',
            { name: 'clipboard', groups: [ 'undo', 'clipboard' ] },
            { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi', 'paragraph' ] },
            { name: 'styles', groups: [ 'styles' ] },
            { name: 'colors', groups: [ 'colors' ] },
            { name: 'tools', groups: [ 'tools' ] },
            { name: 'others', groups: [ 'others' ] },
            { name: 'about', groups: [ 'about' ] }
          ],
          removeButtons: 'Cut,Copy,Paste,Internallink'
        })

        // pre fill if needed
        await new Promise(resolve => this.editor.setData(this.props.data, { callback: resolve }))

        this.editor.on('change', (evt) => {
          this.props.onChange(evt.editor.getData())
        })

        this.props.setCkeditorRef(this.editor)
      }
    } catch (error) {
      logger.error(error)
    }
  }

  async componentWillUnmount () {
    if (this.editor) {
      await this.editor.destroy()
    }
  }

  render () {
    return (
      <div className={'wysiwyg'}>
        <div className={'ckeditor4'} ref={this.editorRef} />
      </div>
    )
  }
}

export default Wysiwyg
