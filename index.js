const http = require('http')
const qs = require('querystring')
const fs = require('fs')
const { exec } = require('child_process')

// check keys exists

const pubkeyPath = './keys/pubkey.pem'
if (!fs.existsSync(pubkeyPath)) {
    throw new Error('File not found ' + pubkeyPath);
}

const privatekeyPath = './keys/key.pem'
if (!fs.existsSync(privatekeyPath)) {
    throw new Error('File not found ' + privatekeyPath);
}

const certificatePath = './keys/cert.pem'
if (!fs.existsSync(certificatePath)) {
    throw new Error('File not found ' + certificatePath);
}

// run server

const getRandomString = () => {
    return Math.random().toString(36).substring(7);
}

const signHandler = (body, callback) => {
    const randomFileName = './tmp/' + getRandomString();
    fs.writeFile(randomFileName, body, function (err, data) {
        if (err) {
            console.log(err);
            callback('FAIL');
            return;
        }

        exec('openssl dgst -md_gost12_256 -sign '+privatekeyPath+' '+randomFileName+' | base64', (err, stdout, stderr) => {
            if (err) {
                console.log('Error', err);
                callback('FAIL')
                return;
            }

            let out = stdout.replace(/\n/, '')
            // url safe base64
            out = out.replace(/=/g, '')
            out = out.replace(/\+/g, '-')
            out = out.replace(/\//g, '_')
            // out
            callback(out)
            fs.unlinkSync(randomFileName);
        });
    });
}

const verifyHandler = (body, signature, callback) => {
    const randomFileName = './tmp/' + getRandomString();
    let fixedSignature = signature.replace(/-/g, '+')
    fixedSignature = fixedSignature.replace(/_/g, '/')
    // make padding
    let correctSignature = fixedSignature.length % 4 !== 0;
    while (correctSignature) {
        fixedSignature += '=';
        correctSignature = fixedSignature.length % 4 !== 0;
    }
    // do it
    fs.writeFile(randomFileName + '.sig', fixedSignature, function (err, data) {
        if (err) {
            console.log(err);
            callback('FAIL')
            return;
        }

        fs.writeFile(randomFileName, body, function (err, data) {
            if (err) {
                console.log(err);
                callback('FAIL')
                return;
            }

            exec('base64 -di '+randomFileName+'.sig > '+randomFileName+'.sig.bin', (err, stdout, stderr) => {
                if (err) {
                    console.log('Error', err);
                    callback('FAIL')
                    return;
                }

                exec('openssl dgst -md_gost12_256 -verify '+ pubkeyPath +' -signature '+randomFileName+'.sig.bin '+randomFileName, (err, stdout, stderr) => {
                    if (err) {
                        console.log('Error', err);
                        callback('FAIL')
                        return;
                    }

                    if (stdout.indexOf('OK') > 0) {
                        callback('OK')
                    } else {
                        callback('FAIL')
                    }

                    // clear
                    fs.unlinkSync(randomFileName);
                    fs.unlinkSync(randomFileName + '.sig');
                    fs.unlinkSync(randomFileName + '.sig.bin');
                });
            });
        });
    });
}

const port = 3000
const requestHandler = (request, response) => {
    response.writeHead(200, {"Content-Type": "text/plain"});
    if (request.method === 'POST') {
        const urlPath = request.url;
        let body = '';

        request.on('data', function (data) {
            body += data;
        });

        request.on('end', function () {
            const post = qs.parse(body);
            if (urlPath === '/sign/') {
                signHandler(post['body'], (result) => {
                    response.end(result);
                })
            } else if (urlPath === '/verify/') {
                verifyHandler(post['body'], post['signature'], (result) => {
                    response.end(result);
                })
            } else {
                response.end('Please read README.md')
            }
        });
    } else {
        response.end('Please read README.md')
    }
}

const server = http.createServer(requestHandler)
server.listen(port, (err) => {
    if (err) {
        return console.log('Error', err)
    }
    console.log(`Server is listening on ${port}`)
})

