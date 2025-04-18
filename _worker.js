/**
 * YouTube Channel: https://youtube.com/@am_clubs
 * Telegram Group: https://t.me/am_clubs
 * GitHub Repository: https://github.com/amclubs
 * Personal Blog: https://amclubs.blogspot.com
 * Personal Blog: https://amclubss.com
 */

let token = "";

export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // Root path returns nginx page
        if (url.pathname === '/') {
            return new Response(await nginx(), {
                headers: { 'Content-Type': 'text/html; charset=UTF-8' },
            });
        }

        const githubRawUrl = constructGithubUrl(url.pathname, env);
        token = getToken(url.searchParams, env);

        if (!token) {
            return new Response('TOKEN cannot be empty', { status: 400 });
        }

        const headers = new Headers({ Authorization: `token ${token}` });

        try {
            const response = await fetch(githubRawUrl, { headers });

            if (!response.ok) {
                const errorText = env.ERROR || 'Failed to fetch file, please check the path or TOKEN.';
                return new Response(errorText, { status: response.status });
            }

            const content = await response.text();
            return new Response(content, {
                status: 200,
                headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
            });

        } catch (error) {
            return new Response(`Error fetching from GitHub: ${error.message}`, { status: 500 });
        }
    }
};

// Construct GitHub raw content URL based on the environment variables and pathname
function constructGithubUrl(pathname, env) {
   const baseUrl = 'https://raw.githubusercontent.com';
    
    if (pathname.startsWith(baseUrl)) {
        return pathname; 
    }
    
    let url = `${baseUrl}/${env.GH_NAME || ''}/${env.GH_REPO || ''}/${env.GH_BRANCH || ''}`.replace(/\/+/g, '/');
    
    url += pathname;

    return url.replace(/\/+/g, '/'); 
}

// Retrieve token from search params or environment variables
function getToken(searchParams, env) {
    const searchToken = searchParams.get('token');
    if (env.TOKEN && env.TOKEN != searchToken ){
       return new Response('please check the token ', { status: 400 });
    }
   return env.GH_TOKEN || searchToken || null;
}

// Simple nginx HTML page
async function nginx() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <title>Welcome to nginx!</title>
        <style>
            body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }
        </style>
    </head>
    <body>
        <h1>Welcome to nginx!</h1>
        <p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
        <p>For online documentation and support please refer to <a href="http://nginx.org/">nginx.org</a>.<br/>
        Commercial support is available at <a href="http://nginx.com/">nginx.com</a>.</p>
        <p><em>Thank you for using nginx.</em></p>
    </body>
    </html>`;
}
