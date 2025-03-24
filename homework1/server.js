const http = require('http');
const url = require('url');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


mongoose.connect('mongodb://127.0.0.1:27017/usersDB');

const userSchema = new Schema
({
    name: String,
    email: String,
    number: Number
});

// Create a user model
const User = mongoose.model('User', userSchema);

const PORT = 5000;

// Create the HTTP server to handle requests
const server = http.createServer(async (req, res) => 
{
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    if (pathname === '/users') 
    {
        if (method === 'GET') 
        {
            try 
            {
                const users = await User.find({});
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(users));
            } 
            catch (err) 
            {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        } 
        else if (method === 'POST') 
        {
            let body = '';
            req.on('data', (chunk) => 
            {
                body += chunk;
            });

            req.on('end', async () => 
            {
                const newUser = JSON.parse(body);
                const user = new User({
                    name: newUser.name,
                    email: newUser.email,
                    number: newUser.number
                });

                try 
                {
                    const savedUser = await user.save();
                    res.statusCode = 201;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({  id: savedUser._id }));
                } 
                catch (err) 
                {
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
            });
        }
    } 
    else if (pathname.startsWith('/users/')) 
    {
        const userId = pathname.split('/')[2];
        if (method === 'GET') 
        {
            try 
            {
                const user = await User.findById(userId);
                if (!user) 
                {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'User Not Found' }));
                } 
                else 
                {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(user));
                }
            } 
            catch (err) 
            {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'User Not Found' }));
            }
        } 
        else if (method === 'PUT') 
        {
            let body = '';
            req.on('data', (chunk) => 
            {
                body += chunk;
            });

            req.on('end', async () => 
            {
                const updatedUser = JSON.parse(body);
                try 
                {
                    const updatedUserDoc = await User.findByIdAndUpdate(userId, { 
                        name: updatedUser.name, 
                        email: updatedUser.email,
                        number: updatedUser.number
                    }, { new: true });
                    if (!updatedUserDoc) 
                    {
                        res.statusCode = 404;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ error: 'User Not Found' }));
                    } 
                    else 
                    {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(updatedUserDoc));
                    }
                } 
                catch (err) 
                {
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'User Not Found' }));
                }
            });
        } 
        else if (method === 'DELETE') 
        {
            try 
            {
                // Delete the user by their ID
                await User.findByIdAndDelete(userId);
                res.statusCode = 204;
                res.end();
            } 
            catch (err) 
            {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'User Not Found' }));
            }
        }
    } 
    else 
    {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start the server
server.listen(PORT, () => 
{
    console.log(`Server running on http://localhost:${PORT}`);
});
