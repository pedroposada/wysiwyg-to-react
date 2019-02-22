import React from 'react'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material.css'
import 'codemirror/theme/neat.css'
import 'codemirror/mode/xml/xml.js'
import 'codemirror/mode/javascript/javascript.js'
import { UnControlled } from 'react-codemirror2'

const CodeMirror = props => {
  const {
    value = '',
    options = {}
  } = props

  return (
    <UnControlled
      {...props}
      value={value}
      options={options}
    />
  )
}

export default CodeMirror
