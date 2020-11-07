import React, { useCallback, useEffect, useState } from 'react'
import { useLists } from 'rmw-shell/lib/providers/Firebase/Lists'
import ChatMessage from 'rmw-shell/lib/components/ChatMessage'
import Input from './Input'
import Chip from '@material-ui/core/Chip'
import Scrollbar from 'material-ui-shell/lib/components/Scrollbar'
import { useTheme } from '@material-ui/core/styles'
import ChatIcon from '@material-ui/icons/Chat'
import { useIntl } from 'react-intl'

const step = 20
let currentUser = null
let currentDate = null

export default function ({ path }) {
  const intl = useIntl()
  const theme = useTheme()
  const { firebaseApp, watchList, getList, unwatchList, clearList } = useLists()
  const [size, setSize] = useState(step)
  const [listEnd, setlistEnd] = useState(null)
  const alias = `${path}_${size}`
  const messages = getList(alias)

  const scrollToBottom = useCallback(() => {
    if (size === step) {
      const node = listEnd
      if (node) {
        node.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [listEnd, size])

  useEffect(() => {
    if (path) {
      let messagesRef = firebaseApp
        .database()
        .ref(path)
        .orderByKey()
        .limitToLast(size)

      watchList(messagesRef, alias)

      return () => {
        if (size === step) {
          unwatchList(alias)
        } else {
          clearList(alias)
        }
      }
    }
  }, [path, size, watchList, clearList, alias, firebaseApp, unwatchList])

  useEffect(() => {
    scrollToBottom()
    setTimeout(() => {
      scrollToBottom()
    }, 1000)
  }, [path, listEnd, messages, scrollToBottom])

  if (!path) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ChatIcon color="disabled" style={{ height: 150, width: 150 }} />
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <div style={{ flexGrow: 1, overflow: 'hidden' }}>
        <Scrollbar
          style={{
            //backgroundColor: theme.palette.background.default,
            width: '100%',
          }}
          renderView={(props) => (
            <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />
          )}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: 500,
              }}
            >
              <div style={{ height: 15 }} />
              <Chip
                label={intl.formatMessage({
                  id: 'load_more_label',
                  defaultMessage: 'more...',
                })}
                onClick={() => {
                  setSize(size + step)
                }}
                size="small"
                style={{
                  width: 80,
                  alignSelf: 'center',
                  margin: 8,
                  backgroundColor: theme.palette.grey[400],
                }}
              />
              {messages.map((m) => {
                const { authorUid = '', created = '' } = m?.val || {}

                const stringDate = created
                  ? new Date(created).toISOString().slice(0, 10)
                  : ''

                let userChanged = authorUid !== currentUser
                let dateChanged = currentDate !== stringDate

                if (userChanged) {
                  currentUser = authorUid
                }

                if (dateChanged) {
                  currentDate = stringDate
                }

                return (
                  <ChatMessage
                    key={m.key}
                    uid={m.key}
                    message={m}
                    path={path}
                    userChanged={userChanged}
                    dateChanged={dateChanged}
                    scrollToBottom={scrollToBottom}
                  />
                )
              })}
            </div>
          </div>

          <div
            style={{ float: 'left', clear: 'both' }}
            ref={(el) => {
              setlistEnd(el)
            }}
          />
          <div style={{ height: 8 }} />
        </Scrollbar>
      </div>
      <div>
        <Input path={path} />
      </div>
    </div>
  )
}
