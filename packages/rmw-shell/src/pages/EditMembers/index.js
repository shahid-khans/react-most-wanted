import React, { useEffect } from 'react'
import { useLists } from 'rmw-shell/lib/providers/Firebase/Lists'
import ListPage from 'material-ui-shell/lib/containers/Page/ListPage'
import { useIntl } from 'react-intl'
import { useHistory, useParams } from 'react-router-dom'
import { useAuth } from 'base-shell/lib/providers/Auth'
import UserRow from 'rmw-shell/lib/components/UserRow'

export default function () {
  const {
    watchList,
    getList,
    clearList,
    isListLoading,
    firebaseApp,
  } = useLists()
  const { auth } = useAuth()
  const intl = useIntl()
  const history = useHistory()
  const { uid } = useParams()
  const groupMembersPath = `group_chats/${uid}/members`

  useEffect(() => {
    watchList('users')
    watchList('admins')
    watchList(groupMembersPath)
    return () => {
      clearList(groupMembersPath)
    }
  }, [watchList, clearList, groupMembersPath])

  const admins = getList('admins')
  const members = getList(groupMembersPath)

  const list = getList('users')
    .map(({ key, val }) => {
      return { key, ...val }
    })
    .filter((u) => u.key !== auth.uid)

  const isChecked = (key) => {
    return members.find((m) => m.key === key)
  }

  const handleRowClick = async (user) => {
    if (isChecked(user.key)) {
      await firebaseApp
        .database()
        .ref(`${groupMembersPath}/${user.key}`)
        .set(null)
    } else {
      await firebaseApp
        .database()
        .ref(`${groupMembersPath}/${user.key}`)
        .set(true)
    }
  }

  return (
    <React.Fragment>
      <ListPage
        name="users"
        list={list}
        Row={(p) => {
          return (
            <UserRow
              {...p}
              admins={admins}
              handleRowClick={handleRowClick}
              hasCheckbox
              isChecked={isChecked(p.data.key)}
            />
          )
        }}
        listProps={{ itemSize: 82 }}
        getPageProps={(list) => {
          return {
            pageTitle: intl.formatMessage({
              id: 'edit_members',
              defaultMessage: 'Edit members',
            }),
            isLoading: isListLoading('users'),
            onBackClick: () => {
              history.goBack()
            },
          }
        }}
      />
    </React.Fragment>
  )
}
