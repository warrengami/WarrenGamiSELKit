// File: generate-hash.js

const bcrypt = require('bcrypt');

// The access code you want to use
const accessCode = 'WARRENGAMI2025';

// The "salt rounds" determine how much time is needed to calculate a single hash.
// 10 is a good default value.
const saltRounds = 10;

async function generateHash() {
    try {
        console.log(`Generating hash for: "${accessCode}"`);
        const hash = await bcrypt.hash(accessCode, saltRounds);
        console.log('---');
        console.log('New Bcrypt Hash:');
        console.log(hash);
        console.log('---');
        console.log('Update this value in your .env file or Vercel environment variables.');
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

generateHash();//
//  generate-hash.js
//  
//
//  Created by Warren Charleston on 7/20/25.
//

