import indexRouter from './routes/index'
import usersRouter from './routes/users'
import uploadRouter from './routes/upload'

const routers = [
    {
        path: '/',
        module: indexRouter
    },
    {
        path: '/users',
        module: usersRouter
    },
    {
        path: '/multerUpload',
        module: uploadRouter
    }
]

module.exports = routers