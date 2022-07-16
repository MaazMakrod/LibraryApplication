const { UserInputError, AuthenticationError } = require('apollo-server')

const Author = require('../models/Author')
const Book = require('../models/Book')
const User = require('../models/User')

const jwt = require('jsonwebtoken')
const JWT_SECRET = 'NEED_HERE_A_SECRET_KEY'

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const resolvers = {
    Query: {
        bookCount: async () => Book.collection.countDocuments(),
        authorCount: async () => Author.collection.countDocuments(),
        allBooks: async (root, args) => {
  
          if(!args.author && !args.genre) 
            return Book.find({}).populate('author')
          else {
            if(args.author && args.genre) {
              let author = await Author.findOne({name : args.author})
              return Book.find({author: author._id, genres: { $in: [args.genre] }}).populate('author')
            }
            else if(args.genre) {
              if(args.genre === '***')
                return Book.find({}).populate('author')
  
              return Book.find({genres: { $in: [args.genre] }}).populate('author')
            }            
            else {
              let author = await Author.findOne({name : args.author})
              return Book.find({author: author._id}).populate('author')
            }
          }
        },
        allAuthors: async (root, args) => {
            console.log('here')
            return Author.find({})
        },
        me: (root, args, context) => {
          return context.currentUser
        }
      },
      Mutation: {
        addBook: async (root, args, context) => {
            console.log(args);
  
            const user = context.currentUser;
  
            if (!user) {
              throw new AuthenticationError('not authenticated')
            }
  
            const book = new Book({...args})
            const author = await Author.find({name: args.author})
  
            if(author.length === 0 ) {
              const newAuthor = new Author({
                name: args.author
              })
  
              try {
                await newAuthor.save()
              } catch (error) {
                throw new UserInputError(error.message, {
                  invalidArgs: args,
                })
              }
  
              book.author = newAuthor._id
            } else 
              book.author = author[0]._id          
  
            try {
              await book.save()
            } catch (error) {
              throw new UserInputError(error.message, {
                invalidArgs: args,
              })
            }
  
            const returnBook = await Book.findById({_id: book._id}).populate('author')
            pubsub.publish('BOOK_ADDED', { bookAdded: returnBook })
  
            return returnBook
        },
        editAuthor: async (root, args, context) => {
          const user = context.currentUser
  
          if (!user) {
            throw new AuthenticationError('not authenticated')
          }
  
          const authorList = await Author.find({name: args.name})
  
          if (authorList.length === 0) {
              return null
          }
      
          const author = authorList[0]
          author.born = args.setBornTo
  
          try {
              await author.save()
          } catch (error) {
              throw new UserInputError(error.message, {
                  invalidArgs: args,
              })
          }
          return author
        },
        createUser: async (root, args) => {
          const user = new User({ ...args })
      
          return user.save()
            .catch(error => {
              throw new UserInputError(error.message, {
                invalidArgs: args,
              })
            })
        },
        login: async (root, args) => {
          const user = await User.findOne({ username: args.username })
      
          console.log('user', user)
  
          if ( !user || args.password !== 'secret' ) {
            throw new UserInputError("wrong credentials")
          }
      
          const userForToken = {
            username: user.username,
            id: user._id,
          }
      
          const returnVal = { value: jwt.sign(userForToken, JWT_SECRET), favouriteGenre: user.favouriteGenre }
          console.log(returnVal)
  
          return returnVal
        }
      },
      Subscription: {
        bookAdded: {
            subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        },
    }
}

  module.exports = resolvers