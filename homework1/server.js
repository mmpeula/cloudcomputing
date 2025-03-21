const http = require('http');
const url = require('url');
const fs = require('fs'); // to work with file I/O

const PORT = 5000;

// In-memory object to store the users.
let users = {};

// Create HTTP server
const server = http.createServer((req, res) => 
{
    const parsedUrl = url.parse(req.url, true);
    const method = req.method;
    const pathname = parsedUrl.pathname;

    if (pathname === '/users') 
    {
        if (method === 'GET') 
        {
            // Return all users stored in memory
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(Object.values(users)));
        } 
        else if (method === 'POST') 
        {
            let body = '';
            req.on('data', (chunk) => 
            {
                body += chunk;
            });

            req.on('end', () =>
            {
                const newUser = JSON.parse(body);
                const newId = Date.now().toString(); // Use current timestamp as a unique ID
                users[newId] = { id: newId, name: newUser.name, email: newUser.email };

                res.statusCode = 201;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ id: newId }));
            });
        }
    } 
    else if (pathname.startsWith('/users/')) 
    {
        const userId = pathname.split('/')[2];
        if (method === 'GET') 
        {
            // Return the user with the specified ID
            if (users[userId]) 
            {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(users[userId]));
            } 
            else 
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
                body += chunk;  // Collect the body of the request
            });
    
            req.on('end', () => 
            {
                const updatedUser = JSON.parse(body);  // Convert the body to a JSON object
                
                // Check if the user with the specified id exists
                if (users[userId]) 
                {
                    // Update the user
                    users[userId].name = updatedUser.name;
                    users[userId].email = updatedUser.email;
    
                    // Respond with the updated user
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(users[userId]));  // Send the updated user in the response
                } 
                else 
                {
                    // If the user is not found, respond with a 404 error
                    res.statusCode = 404;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ error: 'User Not Found' }));
                }
            });
        } 
        else if (method === 'DELETE') 
        {
            // Delete the user with the specified ID
            if (users[userId]) 
            {
                delete users[userId];

                res.statusCode = 204;
                res.end();
            } 
            else 
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

server.listen(PORT, () => 
{
    console.log(`Server running on http://localhost:${PORT}`);
});
