import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from '../queries'

const Recommend = (props) => {
  let {data, loading} = useQuery(ALL_BOOKS, {
    variables: { genre: localStorage.getItem('library-user-fav-genre') } 
  }); 

  if (!props.show || loading) {
    return null
  }

  return (
    <div>
      <h2>books based on your favorite genre: {localStorage.getItem('library-user-fav-genre')}</h2>
        {
            data.allBooks.length > 0 ?
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
            </table> : <>None</>
        }
      
    </div>
  )
}

export default Recommend
