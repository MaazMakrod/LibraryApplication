import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import Select from 'react-select'
import { useState } from 'react'

import { useMutation } from '@apollo/client'
import { EDIT_AUTHOR } from '../queries'

const Authors = (props) => {
  const [name, setName] = useState(null)
  const [born, setBorn] = useState(null)
  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS}]
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    console.log({
      name: name.value,
      setBornTo: Number(born)
    })

    editAuthor({ variables: {
      name: name.value,
      setBornTo: Number(born)
    }})

    setBorn(null)
    setName(null)
  }

  const authors = useQuery(ALL_AUTHORS, {
    pollInterval: 5000
  }) 

  if (!props.show || authors.loading) {
    return null
  }

  console.log(authors)

  const options = authors.data.allAuthors.map(a => {
    return {
      value: a.name,
      label: a.name
    }
  })


  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.data.allAuthors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {
        window.localStorage.getItem('library-user-token') &&

          <>
            <h2>set birth year</h2>

            <form onSubmit={handleSubmit}>
              <div>
                <Select options={options} onChange={setName} value={name} />
              </div>
              <div>
                Born
                <input
                    type="number"
                    value={born}
                    onChange={({ target }) => setBorn(target.value)}
                  />
              </div>
              <button type="submit">edit author</button>
            </form>
          </>
      }

      
    </div>
  )
}

export default Authors
