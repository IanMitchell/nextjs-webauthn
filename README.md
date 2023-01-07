# next-webauthn Demo

WebAuthn is cool but isn't the most straightforward thing to implement. I've created this demo so people don't have to spend multiple days tearing their hair out like I did.

If you'd like to read more of a guided tour of the code, check out [my blog post](https://ianmitchell.dev/blog/nextjs-and-webauthn).

## Things to Note!

This is a demo, it is not a fully developed implementation. There are several shortcuts (or bugs if you're feeling mean) in this demonstration you'll need to account for yourself - input validation, error handling, and things like that.

One particularly nasty detail that deserves a special call out is this demo's error handling does not stop the browser from creating a passkey. For example, if you register with an email, log out, and try to register again with the same email, this website will show you an error **but a passkey will still be created.** The correct flow would be to have a user create a passkey and then proceed to register with an email and username in a separate step.

So use this demo as a starting point, but you'll need to do more than just copy-paste to use this in an actual application.
