import React from 'react'
import 'element-theme-default'
import {
  Button,
  // Dropdown,
  MessageBox,
  // Loading,
  Input,
  Tooltip,
  Notification
} from 'element-react'
import withRouter from 'react-router-dom/withRouter'
import { css, cx } from 'emotion'
// import isEqual from 'lodash.isequal'
import api from './api'
import logger from './logger'
// import moment from 'moment'
import HTMLtoJSX from 'htmltojsx'
import CodeMirror from './CodeMirror'
import ClipboardJS from 'clipboard'
import Wysiwyg from './Wysiwyg'
import pretty from 'pretty'

const PAGE_OFFSET = '50px'

const htmltojsxConverter = new HTMLtoJSX({
  createClass: false
})

const initState = {
  modelRemote: '',
  model: '',
  parentId: undefined,
  title: undefined,
  mode: 'edit',
  isLoadingAll: false,
  activeDocId: '',
  jsx: ''
}

class App extends React.Component {
  state = {
    ...initState,
    docs: []
  }

  async componentDidMount () {
    //   this.setState({ isLoadingAll: true })

    //   try {
    //     const { data: docs } = await api({
    //       url: '/docs',
    //       method: 'GET'
    //     })

    //     this.setState({ docs: docs })
    //   } catch (error) {
    //     logger.error(error)
    //   }

    //   this.setState({ isLoadingAll: false })

    // clipboard
    const clipboard = new ClipboardJS('.clipboardButton', {
      text: trigger => this.state.jsx
    })

    clipboard.on('success', e => {
      // logger.debug(e)

      Notification.success('React component copied to clipboard successfully!')
    })

    clipboard.on('error', e => {
      logger.error(e)
    })
  }

  previewRef = React.createRef()

  ckeditorRef = null

  handleClearChanges = async _ => {
    try {
      await MessageBox.confirm(
        'Your changes will be lost, are you sure?'
        , 'Clear editor and start from scratch'
        , {
          confirmButtonText: 'CLEAR CHANGES',
          cancelButtonText: 'CANCEL'
        }
      )

      this.ckeditorRef.setData()

      this.setState({
        ...initState
      })
    } catch (error) {
      // do nothing
    }

    // this.props.push('/')
  }

  setCkeditorRef = ref => { this.ckeditorRef = ref }

  render () {
    // const {
    //   // location: { pathname },
    //   history: { push }
    // } = this.props

    // const {
    //   parentId,
    //   title,
    //   docs,
    //   model,
    //   modelRemote,
    //   mode,
    //   isLoadingAll,
    //   activeDocId,
    //   jsx
    // } = this.state

    // const setState = this.setState.bind(this)

    // const previewRef = this.previewRef

    return (
      <Main
        {...this.state}
        {...this.props}
        {...this}
        setState={this.setState.bind(this)}
      />
    )
  }
}

const Main = props => {
  const {
    modelRemote,
    mode,
    jsx,
    setState,
    previewRef,
    setCkeditorRef
  } = props

  return (
    <div className={css`
      padding-top: ${PAGE_OFFSET};

      .nav {
        z-index: 999;
        display: flex;
        justify-content: space-between;
        height: ${PAGE_OFFSET};
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #ffffff;
        align-items: center;
        padding: 0 .5rem;

        > div {
          display: flex;
        }

        .docsButton {
          margin-right: 10px;

          ul {
            white-space: nowrap;
          }
        }

        .feedback {
          font-weight: lighter;
        }

        button {
          font-weight: bold;
        }
      }

      .docsList {
        width: 200px;
        /* top: ${PAGE_OFFSET}; */
        left: 0;
        position: fixed;
        height: calc(100vh - ${PAGE_OFFSET});
        box-sizing: border-box;
        background-color: #F9FAFC;
        overflow: auto;
        z-index: 1;

        .docItem {
          padding: .5rem;
          font-weight: lighter;
          font-size: 13.5px;
          border-bottom: 1px solid #D3DCE6;
          cursor: pointer;

          &.active {
            background-color: #1D8CE0;
            color: #ffffff;
          }
        }
      }
      
      .mainArea {
        
        .editorArea {
          flex-grow: 1;
          /* margin-left: 200px; */

          .cke_inner.cke_reset {
            div[id$="_contents"] {
              height: calc(100vh - ${PAGE_OFFSET} - 77px) !important;
            }
          }
          
          .wysiwyg {
            height: calc(100vh - ${PAGE_OFFSET});
            background: #EFEFEF;

            > div {
              max-width: 800px;
              margin: auto;
            }
          }
          
          .preview {
            height: calc(100vh - ${PAGE_OFFSET});
            box-sizing: border-box;
            background: #EFEFEF;
            padding: 2rem 2rem;
            
            .html {
              background: #ffffff;
              min-height: 100%;
              padding: 1cm 2cm;
              box-sizing: border-box;
              max-width: 800px;
              margin: auto;
            }
          }

          .export {
            position: relative;

            .CodeMirror {
              height: calc(100vh - ${PAGE_OFFSET});
            }

            .clipboardButton {
              position: absolute;
              top: 5px;
              right: 5px;
              z-index: 3;
            }
          }
        }
      }
    `}>

      {/* LIST OF VERSIONS */}
      {/* <div className={'docsList'}>
        <ListOfVersions {...props} />
      </div> */}

      <div className={'mainArea'}>

        {/* ACTIONS */}
        <Actions {...props} />

        {/* EDITOR AREA */}
        <div className={'editorArea'}>

          {/* EDITOR */}
          <div className={cx('edit', {
            [css`display: none;`]: mode !== 'edit'
          })}>
            <Wysiwyg
              setCkeditorRef={setCkeditorRef}
              data={modelRemote}
              onChange={data => setState({ model: data })}
            />
          </div>

          {/* PREVIEW */}
          {mode === 'preview' &&
            <div className={'preview'}>
              <div className={'html'} ref={previewRef} />
            </div>
          }

          {/* EXPORT TO JSX */}
          {mode === 'export' &&
            <div className={'export'}>
              <button
                className={'el-button clipboardButton el-button--success'}
              >
              COPY TO CLIPBOARD
              </button>

              <CodeMirror
                value={jsx}
                options={{
                  mode: 'javascript',
                  theme: 'material',
                  lineNumbers: true,
                  lineWrapping: true,
                  readOnly: true
                }}
              />
            </div>
          }

        </div>

      </div>

    </div>
  )
}

// const ListOfVersions = props => {
//   const {
//     docs,
//     setState,
//     activeDocId,
//     isLoadingAll,
//     parentId
//   } = props

//   return (
//     <>
//       <Dropdown
//         className={'docsButton'}
//         trigger={'click'}
//         onCommand={async id => {
//           setState({ isLoadingAll: true })

//           const doc = docs.find(doc => doc.id === id)

//           // find most recent doc
//           const mostRecentDoc = docs.filter(doc => doc.parentId === id || doc.id === id)
//             .sort((a, b) => +b.createdAt - a.createdAt)
//             .shift()

//           try {
//             // get it
//             await getDocById({
//               activeDocId,
//               doc: mostRecentDoc,
//               setState
//             })
//           } catch (error) {
//             logger.error(error)
//           }

//           setState({
//             parentId: doc.id,
//             title: doc.title,
//             mode: 'edit',
//             isLoadingAll: false
//           })
//         }}
//         menu={
//           <Dropdown.Menu>
//             {docs.filter(doc => !!doc.title)
//               .sort((a, b) => {
//                 if (a.title < b.title) { return -1 }
//                 if (a.title > b.title) { return 1 }
//                 return 0
//               })
//               .map((doc = {}, idx) => (
//                 <Dropdown.Item
//                   className={'menuOption'}
//                   key={idx}
//                   command={doc.id}
//                 >{doc.title}</Dropdown.Item>
//               ))}
//           </Dropdown.Menu>
//         }
//       >
//         <Button
//           loading={isLoadingAll}
//           disabled={!docs.filter(doc => !!doc.title).length}
//         >
//           <span>
//                 DOCS ({docs.filter(doc => !!doc.title).length})
//             <i className='el-icon-caret-bottom el-icon--right' />
//           </span>
//         </Button>
//       </Dropdown>

//       {/* LIST */}
//       <StateHandler>
//         {({ handleState, state }) =>
//           <React.Fragment>
//             {state.isLoading && <Loading fullscreen />}

//             {!parentId &&
//             <div className={'docItem'}>Select a doc from "DOCS"</div>
//             }

//             {parentId &&
//             <React.Fragment>

//               {/* GET A DOC */}
//               {docs.filter(doc => doc.parentId === parentId || doc.id === parentId)
//                 .sort((a, b) => +b.createdAt - a.createdAt)
//                 .map((doc, idx) => (
//                   <div
//                     className={cx({
//                       docItem: true,
//                       active: activeDocId === doc.id
//                     })}
//                     key={idx}
//                     onClick={async _ => {
//                       await getDocById({
//                         activeDocId,
//                         doc,
//                         setState,
//                         handleState
//                       })

//                       setState({ mode: 'edit' })
//                     }}
//                   >
//                     <div className={'row'}>Revision created on</div>
//                     <div className={'row'}>{moment(doc.createdAt).format('MM/DD/YYYY hh:mm:ss:SSS a')}</div>
//                   </div>
//                 ))
//               }

//             </React.Fragment>
//             }
//           </React.Fragment>
//         }
//       </StateHandler>
//     </>
//   )
// }

const Actions = props => {
  const {
    mode,
    setState,
    previewRef,
    model,
    title,
    parentId,
    // modelRemote,
    docs,
    handleClearChanges
  } = props

  return (
    <div className={'nav'}>
      <div className={'left'}>

        <Button
          onClick={_ => setState({ mode: 'edit' })}
          disabled={mode === 'edit'}
        >
              EDIT
        </Button>

        <Button
          onClick={async _ => {
            await setState({ mode: 'preview' })

            previewRef.current.innerHTML = model
          }}
          disabled={mode === 'preview'}
        >
          PREVIEW
        </Button>

        <Button
          onClick={_ => {
            const cute = pretty(model)

            const converted = htmltojsxConverter.convert(cute)

            const component = `
import React from 'react'

const ExportedComponent = props => {
  return (
    
    ${converted}
  )
}

export default ExportedComponent
`
            setState({
              jsx: component,
              mode: 'export'
            })
          }
          }
          disabled={mode === 'export' || !model}
        >
              EXPORT to REACT
        </Button>

        <Button
          onClick={async _ => {
            MessageBox.msgbox({
              title: 'Help',
              message: 'This is a web app to create React components from html that is generated via the text editor. Enter some text and then hit the "EXPORT to REACT" button to see the results.',
              showCancelButton: false,
              confirmButtonText: 'OK'
            })
          }}
          icon={'information'}
        >
          HELP
        </Button>

        {/* CREATE DOC */}
        {/* <StateHandler>
          {({ handleState, state }) =>
            <Button
              onClick={async _ => {
                handleState({ isLoading: true })

                let newTitle

                if (!title) {
                  try {
                    const { value } = await MessageBox.prompt(
                      'Please enter a Title for this document',
                      'Set Title',
                      {
                        confirmButtonText: 'OK',
                        cancelButtonText: 'Cancel',
                        inputPattern: /\w/,
                        inputErrorMessage: 'Invalid Title'
                      }
                    )

                    newTitle = `${value}`.trim()

                    setState({ title: newTitle })
                  } catch (error) {
                    handleState({ isLoading: false })

                    return
                  }
                }

                try {
                  const { data: doc } = await api({
                    url: '/docs',
                    method: 'POST',
                    data: {
                      parentId: parentId,
                      title: newTitle,
                      contents: model
                    }
                  })

                  setState(({ docs }) => ({
                    modelRemote: model,
                    docs: [ ...docs, doc ],
                    activeDocId: doc.id
                  }))

                  if (!parentId) {
                    setState({ parentId: doc.id })
                  }
                } catch (error) {
                  logger.error(error)

                  setState({ title: undefined })
                }

                handleState({ isLoading: false })
              }}

              loading={state.isLoading}
              type={'primary'}
              disabled={isEqual(model, modelRemote) || model === ''}
            >
              SAVE
            </Button>
          }
        </StateHandler> */}

      </div>

      <StateHandler>
        {({ handleState, state }) =>
          <>
            {state.mode === 'edit' &&
            <form className={css`
              display: flex; 
              align-items: center;
            `}>
              <Input
                placeholder={'enter a title'}
                value={state.title}
                onChange={value => handleState({ title: value })}
              />
              <Button
                nativeType={'submit'}
                disabled={!/\w/.test(state.title) || state.title === title}
                icon={'circle-check'}
                type={'primary'}
                loading={state.isLoading}
                size={'small'}
                onClick={async e => {
                  e.preventDefault()

                  handleState({ isLoading: true })

                  try {
                    await api({
                      url: `/docs/${parentId}`,
                      method: 'PUT',
                      data: {
                        id: parentId,
                        title: state.title
                      }
                    })

                    setState({
                      title: state.title,
                      docs: [
                        ...docs.filter(doc => doc.id !== parentId),
                        {
                          ...docs.find(doc => doc.id === parentId),
                          title: state.title
                        }
                      ]
                    })
                  } catch (error) {
                    logger.error(error)
                  }

                  handleState({
                    mode: undefined,
                    isLoading: false
                  })
                }}
              >SAVE</Button>
              <Button
                size={'small'}
                onClick={_ => handleState({ mode: undefined })}
                icon={'circle-close'}
              >CANCEL</Button>
            </form>
            }

            {!state.mode &&
            <Tooltip content={'double click to edit'}>
              <div
                className={cx('feedback', css`cursor: pointer;`)}
                onDoubleClick={_ => handleState({ mode: 'edit', title: title })}
              >
                {title && `Title: ${title}`}
              </div>
            </Tooltip>
            }
          </>
        }
      </StateHandler>

      <Button
        type={'warning'}
        onClick={handleClearChanges}
        disabled={!model}
      >
            START NEW
      </Button>

    </div>
  )
}

const getDocById = async ({
  activeDocId = '',
  doc = {},
  setState = () => {},
  handleState = () => {}
}) => {
  if (activeDocId && activeDocId === doc.id) {
    return
  }

  handleState({ isLoading: true })

  try {
    const { data } = await api({
      url: `/docs/${doc.id}`,
      method: 'GET'
    })

    setState({
      model: data.contents,
      modelRemote: data.contents,
      activeDocId: doc.id
    })
  } catch (error) {
    logger.error(error)
  }

  handleState({ isLoading: false })
}

class StateHandler extends React.Component {
  state = {}

  render () {
    return this.props.children({
      handleState: this.setState.bind(this),
      state: this.state
    })
  }
}

export default withRouter(App)
