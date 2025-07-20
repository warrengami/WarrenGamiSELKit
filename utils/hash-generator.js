
const bcrypt = require('bcrypt');
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const SALT_ROUNDS = 12;

readline.question('Enter the plain-text access code to hash: ', code => {
  if (!code) {
    console.error('Error: No code provided.');
    readline.close();
    return;
  }

  bcrypt.hash(code, SALT_ROUNDS, (err, hash) => {
    if (err) {
      console.error('Error hashing code:', err);
    } else {
      console.log("\n✅ Hashing Successful!");
      console.log("------------------------------------------");
      console.log("Plain-text code:", code);
      console.log("Secure Hash:", hash);
      console.log("------------------------------------------");
    }
    readline.close();
  });
});
