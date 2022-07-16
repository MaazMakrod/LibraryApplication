import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import { useApolloClient, useSubscription } from '@apollo/client'
import Recommend from './components/Recommend'
import { BOOK_ADDED, ALL_AUTHORS, ALL_BOOKS } from './queries'
import _ from 'lodash'

const App = () => {
  const [page, setPage] = useState('authors')
  const [loggedIn, setLoggedIn] = useState(null);
  const client = useApolloClient()

  const updateCacheWithBook = (addedBook) => {
    const includedIn = (set, object) => set.map(b => b.id).includes(object.id)  
    const dataInStore = _.cloneDeep(client.readQuery({ query: ALL_BOOKS }))
    if (!includedIn(dataInStore.allBooks, addedBook)) {
        dataInStore.allBooks.push(addedBook)
        client.writeQuery({
            query: ALL_BOOKS,
            data: { allBooks: dataInStore.allBooks }
        })
        updateCacheWithAuthor(addedBook.author)
    }   
    console.log(_.cloneDeep(client.readQuery({ query: ALL_BOOKS })))
}

const updateCacheWithAuthor = (addedAuthor) => {
    const includedIn = (set, object) => set.map(a => a.id).includes(object.id)  
    const dataInStore = _.cloneDeep(client.readQuery({ query: ALL_AUTHORS }))
    if (!includedIn(dataInStore.allAuthors, addedAuthor)) {
        addedAuthor.born = null
        dataInStore.allAuthors.push(addedAuthor)
        client.writeQuery({
            query: ALL_AUTHORS,
            data: { allAuthors: dataInStore.allAuthors }
        })
    }   
}

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
        const addedBook = subscriptionData.data.bookAdded
        window.alert(`The Book ${addedBook.title} was added!`)
        updateCacheWithBook(addedBook)
    }
})

  const logout = () => {
    setLoggedIn(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>

        {
          loggedIn ? <>
                      <button onClick={() => setPage('add')}>add book</button>
                      <button onClick={() => setPage('recommend')}>recommend</button>
                      <button onClick={() => logout()}>logout</button>
                    </> : 
                    <>
                      <button onClick={() => setPage('login')}>login</button>
                    </>
        }
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Recommend show={page === 'recommend'} />

      <Login show={page === 'login'} setLoggedIn={setLoggedIn} setPage={setPage} />
    </div>
  )
}

export default App
