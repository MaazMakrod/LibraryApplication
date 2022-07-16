import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'
import _ from 'lodash'

const Books = (props) => {
  let {data, loading, refetch} = useQuery(ALL_BOOKS); 

  if (!props.show || loading) {
    return null
  }

  const filters = data.allBooks.map(book => book.genres).reduce((first, second) => _.union(first, second))
  //const booksToShow = books.filter(book => filter === 'all'? true:book.genres.find(genre => genre.toLowerCase() === filter.toLowerCase())) 

  const changeFilter = (filter) => {
    if(filter !== 'reset')
      refetch({ genre: filter })
    else
      refetch({ genre: '***' })
  }

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {data.allBooks.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {
        filters.map(f => {
          return (
            <button onClick={() => changeFilter(f)} value={f}>{f}</button>
          )
        })
      }

      <button onClick={() => changeFilter('reset')} value={'reset'}>Reset Filters</button>
    </div>
  )
}

export default Books
