(() => {const log=console.log.bind(console);console.log=function(...logs){log(...logs);document.write(logs.join('&nbsp;') + '<br />');}})();
// Advanced slice. https://scratch.mit.edu/users/0znzw/
// All rights reserved

String.prototype.cutPattern = (() => {
  function cutPattern(pattern) {
    pattern = pattern.split('');
    let token, char, str = '', i = 0;
    let ptoken, groups = [];
    let canToken = true, tdat = [];
    returnLoop: while(true) {
      char = pattern.shift();
      if ((char ?? '') === '') break;
      if (char.trim() === '') continue;
      if (cutPattern.REGtokens.test(char)) {
        ptoken ??= token;
        token = char;
        if (
          (Array.isArray(canToken) && !canToken.includes(token)) ||
          !canToken
        ) {
          throw new Error(`Unexpected token in cut pattern: `+token);
        }
        switch(token) {
          case cutPattern.MAPtokens.EALL: {
            char = pattern.shift();
            if ((char ?? '') !== '') {
              throw new Error(`Unexpected token in cut pattern: `+char);
            }
            str += this.slice(i);
            break returnLoop;
          };
          case cutPattern.MAPtokens.SSLC: {
            canToken = [
              cutPattern.MAPtokens.SLCS,
              cutPattern.MAPtokens.REPT,
              cutPattern.MAPtokens.ESLC,
            ];
            tdat.length = 0;
            break;
          };
          case cutPattern.MAPtokens.SLCS:
          case cutPattern.MAPtokens.REPT: {
            if (ptoken !== cutPattern.MAPtokens.SSLC) {
              throw new Error(`Unexpected slice-token in cut pattern: `+token);
            }
            canToken.shift();
            canToken.shift();
            break;
          };
          case cutPattern.MAPtokens.ESLC: {
            canToken = true;
            switch(tdat[2]) {
              case cutPattern.MAPtokens.REPT: {
                str += this.substr(i, tdat[0]).repeat(tdat[1]);
                break;
              };
              case cutPattern.MAPtokens.SLCS: {
                str += this.substr(tdat[0], tdat[1]);
                break;
              };
              default: break;
            }
            tdat.length = 0;
            break;
          };
          case cutPattern.MAPtokens.GRPD: {
            canToken = [
              cutPattern.MAPtokens.GRPO,
            ];
            tdat.length = 0;
            tdat.push(token);
            break;
          };
          case cutPattern.MAPtokens.GRPO: {
            if (tdat.length !== 1) {
              throw new Error('Invalid group positioning.');
            }
            canToken = [
              cutPattern.MAPtokens.GRPC,
            ];
            tdat.push('');
            while(true) {
              char = pattern.shift();
              if ((char ?? '') === '') {
                throw new Error('Unclosed group.');
              }
              if (char === '\\') {
                switch(pattern[0]) {
                  case '\\':
                  case cutPattern.MAPtokens.GRPC: {
                    char = pattern.shift();
                    break;
                  };
                }
              } else if (
                char === cutPattern.MAPtokens.GRPC
              ) {
                canToken = true;
                break;
              }
              tdat[1] += char;
            }
            groups.push(tdat[1]);
            tdat.length = 0;
            break;
          };
          case cutPattern.MAPtokens.COND: {
            canToken = [
              cutPattern.MAPtokens.SLCS,
            ];
            break;
          };
          default: break;
        }
        continue;
      }
      if (cutPattern.REGnums.test(char) && token !== null) {
        let num = char;
        while(true) {
          char = pattern.shift();
          if ((char ?? '') === '') break;
          if (!cutPattern.REGnums.test(char)) {
            pattern.unshift(char);
            char = null;
            break;
          }
          num += char;
        }
        num = parseInt(num);
        switch(token) {
          case cutPattern.MAPtokens.GRAB: {
            str += this.substr(i, num);
            break;
          };
          case cutPattern.MAPtokens.BACK: {
            num = 0 - num;
            break;
          };
          case cutPattern.MAPtokens.SSLC: {
            tdat.push(num);
            num = 0;
            break;
          };
          case cutPattern.MAPtokens.SLCS:
          case cutPattern.MAPtokens.REPT: {
            tdat.push(num);
            tdat.push(token);
            num = 0;
            break;
          };
          case cutPattern.MAPtokens.GREV: {
            str += this.substr(i, num).split('').reverse().join('');
            break;
          };
          case cutPattern.MAPtokens.APPD: {
            str += groups[num - 1] ?? '';
            num = 0;
            break;
          };
          case cutPattern.MAPtokens.EXEC: {
            pattern.unshift(...(groups[num - 1] ?? ' '));
            num = 0;
            break;
          };
          case cutPattern.MAPtokens.GOTO: {
            i = Math.min(Math.max(num, 0), this.length - 1);
            num = 0;
            break;
          };
          case cutPattern.MAPtokens.SKIP:
          default: break;
        }
        i += num;
        ptoken = token;
        token = null;
        continue;
      }
      throw new Error(`Unexpected token in cut pattern: `+char);
    }
    return str;
  }
  cutPattern.MAPtokens = {
    EALL: `;`, // end all, eof token
    GRAB: `+`, // grab some tokens
    SKIP: `>`, // go forward tokens
    SSLC: `[`, // start slice
    ESLC: `]`, // end slice
    SLCS: `,`, // slice seperator
    BACK: `<`, // go back tokens
    REPT: `*`, // repeat string using slice syntax
    GREV: `-`, // reverse grab (grabs then reverses the data)
    GRPO: `(`, // group open token
    GRPC: `)`, // group close token
    GRPD: `#`, // define group data
    EXEC: `$`, // execute expression using a group
    APPD: `&`, // append to string using a group
    GOTO: `@`, // sets the current index
  };
  cutPattern.REGtokens = /[;+>\[<,\]*\-&()$#@?:]/;
  cutPattern.REGnums = /[0-9]/;
  cutPattern.REGmatch = /[=!]/;
  return cutPattern;
})();
console.log(`abc123defg`.cutPattern('+3>3;')); // abcdefg
console.log(`abc123defg`.cutPattern('+3>2+3')); // abc3de
console.log(`abc123defg`.cutPattern('+3<3+3')); // abcabc
console.log(`abc123defg`.cutPattern('[3,3]')); // 123
console.log(`abc123defg`.cutPattern('[3*3]')); // abcabcabc
console.log(`abc123defg`.cutPattern('-3;')); // cba123defg
console.log(`the number 3 is < miyo`.cutPattern('>18+4<7+2<6+1')); // miyo <3
console.log(`ohce lloHe", Wordl!`.cutPattern('>1-3<4+1>3+1[10,1]>3+2<5+3>3+5-2+1[10,1]')) // echo "Hello, World!"
console.log(`(Hello`.cutPattern('+6#(, World\\))&1')); // (Hello, World)
console.log(`abc123defg`.cutPattern('#(+3)$1')); // abc
console.log(`abc123defg`.cutPattern('+3@6+3')); // abcdef
