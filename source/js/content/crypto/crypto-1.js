/* ===== Crypto library part A: classical ciphers, encoding & randomness, non-cryptographic hashing ===== */
Object.assign(ALGOS,{

vigenere:{name:'Vigenère cipher',cat:'classical',
 blurb:'A Caesar cipher whose shift changes with each letter, following a repeating keyword. Called “the indecipherable cipher” for 300 years, until Kasiski broke it in 1863.',
 cx:[['Encrypt / decrypt','O(n)','One shift per letter'],['Key space','26^k','k = keyword length'],['Status','Broken','Kasiski test + frequency analysis'],['Use today','Never','Teaching only']],
 pts:['Each letter is shifted by the matching letter of the keyword (A = 0, B = 1, …), and the keyword repeats.','The same plaintext letter can encrypt to different letters, which flattens the frequency histogram.','The weakness is repetition: once you know the key length k, the text splits into k ordinary Caesar ciphers.','Repeated fragments in the ciphertext reveal the key length (the Kasiski examination).'],
 pseudo:['procedure vigenere(text, key, decrypt)','  j ← 0','  for each letter x in text','    k ← key[j mod |key|] − "A"','    if decrypt: k ← −k','    output (x + k) mod 26','    j ← j + 1   // only letters advance the key'],
 trace:[[0,'Encrypt “ATTACK AT DAWN” with keyword “LEMON”.'],[3,'A + L(11) = L. T + E(4) = X. T + M(12) = F. A + O(14) = O. C + N(13) = P.'],[6,'The keyword repeats: K + L = V, A + E = E, T + M = F …'],[5,'Spaces pass through and don’t use up key letters. Result: “LXFOPV EF RNHR”.'],[4,'Decrypting subtracts the same shifts and recovers “ATTACK AT DAWN”.']],
 q:{q:'What is the main weakness of the Vigenère cipher?',o:['It only has 26 keys','The keyword repeats, so the text splits into several Caesar ciphers','It can’t encrypt spaces','It requires a computer'],a:1,why:'Once the period is known, each column is a Caesar cipher that frequency analysis breaks.'},
 code:{
python:`def vigenere(text, key, decrypt=False):
    out, j = [], 0
    for ch in text.upper():
        if "A" <= ch <= "Z":
            k = ord(key[j % len(key)].upper()) - ord("A")
            if decrypt:
                k = -k
            out.append(chr((ord(ch) - 65 + k) % 26 + 65))
            j += 1                      # only letters advance the key
        else:
            out.append(ch)
    return "".join(out)

c = vigenere("ATTACK AT DAWN", "LEMON")
print(c)                                   # LXFOPV EF RNHR
print(vigenere(c, "LEMON", decrypt=True))  # ATTACK AT DAWN`,
javascript:`function vigenere(text, key, decrypt = false) {
  let out = "", j = 0;
  for (const ch of text.toUpperCase()) {
    if (ch >= "A" && ch <= "Z") {
      let k = key.toUpperCase().charCodeAt(j % key.length) - 65;
      if (decrypt) k = -k;
      out += String.fromCharCode(((ch.charCodeAt(0) - 65 + k) % 26 + 26) % 26 + 65);
      j++;
    } else out += ch;
  }
  return out;
}

const c = vigenere("ATTACK AT DAWN", "LEMON");
console.log(c);                            // LXFOPV EF RNHR
console.log(vigenere(c, "LEMON", true));   // ATTACK AT DAWN`,
java:`public class Vigenere {
    static String vigenere(String text, String key, boolean decrypt) {
        StringBuilder out = new StringBuilder();
        int j = 0;
        for (char ch : text.toUpperCase().toCharArray()) {
            if (ch >= 'A' && ch <= 'Z') {
                int k = Character.toUpperCase(key.charAt(j % key.length())) - 'A';
                if (decrypt) k = -k;
                out.append((char) ('A' + Math.floorMod(ch - 'A' + k, 26)));
                j++;
            } else out.append(ch);
        }
        return out.toString();
    }

    public static void main(String[] args) {
        String c = vigenere("ATTACK AT DAWN", "LEMON", false);
        System.out.println(c);                              // LXFOPV EF RNHR
        System.out.println(vigenere(c, "LEMON", true));     // ATTACK AT DAWN
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <cctype>

std::string vigenere(const std::string& text, const std::string& key, bool decrypt = false) {
    std::string out;
    size_t j = 0;
    for (char c : text) {
        char ch = std::toupper(static_cast<unsigned char>(c));
        if (ch >= 'A' && ch <= 'Z') {
            int k = std::toupper(static_cast<unsigned char>(key[j % key.size()])) - 'A';
            if (decrypt) k = -k;
            out += char('A' + ((ch - 'A' + k) % 26 + 26) % 26);
            j++;
        } else out += ch;
    }
    return out;
}

int main() {
    std::string c = vigenere("ATTACK AT DAWN", "LEMON");
    std::cout << c << '\\n';                         // LXFOPV EF RNHR
    std::cout << vigenere(c, "LEMON", true) << '\\n'; // ATTACK AT DAWN
}`}},

railfence:{name:'Rail fence (transposition)',cat:'classical',
 blurb:'Instead of replacing letters, a transposition cipher rearranges them. The rail fence writes the message in a zigzag across several rows, then reads it row by row.',
 cx:[['Encrypt / decrypt','O(n)',''],['Key space','≈ n','Just the number of rails'],['Status','Broken','Try every rail count'],['Lesson','Letters keep their identity','Frequencies are untouched']],
 pts:['Substitution changes which letters appear; transposition changes only their order.','Letter frequencies match normal English exactly, which instantly reveals a transposition cipher.','Modern block ciphers combine both ideas, substitution and permutation, in many rounds (an SP-network).','Decryption recomputes the zigzag pattern to know how many letters belong on each rail.'],
 pseudo:['procedure railFence(text, rails)','  row ← 0; step ← +1','  for each character c in text','    put c on rail[row]','    if row = 0: step ← +1','    if row = rails − 1: step ← −1','    row ← row + step','  return rail[0] + rail[1] + … + rail[rails − 1]'],
 trace:[[0,'Encrypt “WEAREDISCOVEREDFLEEATONCE” with 3 rails.'],[3,'Zigzag: W goes on rail 0, E on 1, A on 2, R on 1, E on 0, D on 1, I on 2, …'],[7,'Rail 0: WECRLTE · rail 1: ERDSOEEFEAOC · rail 2: AIVDEN.'],[7,'Ciphertext: “WECRLTEERDSOEEFEAOCAIVDEN”: the same letters, rearranged.'],[0,'To decrypt, rebuild the zigzag to know each rail’s length, then read along the zigzag again.']],
 q:{q:'How can you tell a transposition cipher from a substitution cipher?',o:['Transposition ciphertext is longer','The ciphertext’s letter frequencies match normal English','Transposition uses numbers','You can’t tell'],a:1,why:'Rearranging letters doesn’t change how often each appears.'},
 code:{
python:`def rail_pattern(n, rails):
    """Rail (row) index of each position as the text zigzags."""
    if rails == 1:
        return [0] * n
    rows, r, step = [], 0, 1
    for _ in range(n):
        rows.append(r)
        if r == 0:
            step = 1
        elif r == rails - 1:
            step = -1
        r += step
    return rows

def encrypt(text, rails):
    rows = rail_pattern(len(text), rails)
    return "".join(ch for r in range(rails) for ch, row in zip(text, rows) if row == r)

def decrypt(cipher, rails):
    rows = rail_pattern(len(cipher), rails)
    order = sorted(range(len(cipher)), key=lambda i: (rows[i], i))   # positions in rail order
    plain = [""] * len(cipher)
    for ch, pos in zip(cipher, order):
        plain[pos] = ch
    return "".join(plain)

c = encrypt("WEAREDISCOVEREDFLEEATONCE", 3)
print(c)              # WECRLTEERDSOEEFEAOCAIVDEN
print(decrypt(c, 3))  # WEAREDISCOVEREDFLEEATONCE`,
javascript:`function railPattern(n, rails) {
  if (rails === 1) return new Array(n).fill(0);
  const rows = [];
  for (let i = 0, r = 0, step = 1; i < n; i++) {
    rows.push(r);
    if (r === 0) step = 1; else if (r === rails - 1) step = -1;
    r += step;
  }
  return rows;
}

function encrypt(text, rails) {
  const rows = railPattern(text.length, rails);
  let out = "";
  for (let r = 0; r < rails; r++) for (let i = 0; i < text.length; i++) if (rows[i] === r) out += text[i];
  return out;
}

function decrypt(cipher, rails) {
  const rows = railPattern(cipher.length, rails);
  const order = [...cipher].map((_, i) => i).sort((a, b) => rows[a] - rows[b] || a - b);
  const plain = new Array(cipher.length);
  order.forEach((pos, k) => { plain[pos] = cipher[k]; });
  return plain.join("");
}

const c = encrypt("WEAREDISCOVEREDFLEEATONCE", 3);
console.log(c);              // WECRLTEERDSOEEFEAOCAIVDEN
console.log(decrypt(c, 3));  // WEAREDISCOVEREDFLEEATONCE`,
java:`import java.util.*;

public class RailFence {
    static int[] railPattern(int n, int rails) {
        int[] rows = new int[n];
        if (rails == 1) return rows;
        for (int i = 0, r = 0, step = 1; i < n; i++) {
            rows[i] = r;
            if (r == 0) step = 1; else if (r == rails - 1) step = -1;
            r += step;
        }
        return rows;
    }

    static String encrypt(String text, int rails) {
        int[] rows = railPattern(text.length(), rails);
        StringBuilder sb = new StringBuilder();
        for (int r = 0; r < rails; r++)
            for (int i = 0; i < text.length(); i++) if (rows[i] == r) sb.append(text.charAt(i));
        return sb.toString();
    }

    static String decrypt(String cipher, int rails) {
        int n = cipher.length();
        int[] rows = railPattern(n, rails);
        Integer[] order = new Integer[n];
        for (int i = 0; i < n; i++) order[i] = i;
        Arrays.sort(order, (a, b) -> rows[a] != rows[b] ? rows[a] - rows[b] : a - b);
        char[] plain = new char[n];
        for (int k = 0; k < n; k++) plain[order[k]] = cipher.charAt(k);
        return new String(plain);
    }

    public static void main(String[] args) {
        String c = encrypt("WEAREDISCOVEREDFLEEATONCE", 3);
        System.out.println(c);              // WECRLTEERDSOEEFEAOCAIVDEN
        System.out.println(decrypt(c, 3));  // WEAREDISCOVEREDFLEEATONCE
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <vector>
#include <numeric>
#include <algorithm>

std::vector<int> railPattern(int n, int rails) {
    std::vector<int> rows(n, 0);
    if (rails == 1) return rows;
    for (int i = 0, r = 0, step = 1; i < n; i++) {
        rows[i] = r;
        if (r == 0) step = 1; else if (r == rails - 1) step = -1;
        r += step;
    }
    return rows;
}

std::string encrypt(const std::string& text, int rails) {
    auto rows = railPattern(text.size(), rails);
    std::string out;
    for (int r = 0; r < rails; r++)
        for (size_t i = 0; i < text.size(); i++) if (rows[i] == r) out += text[i];
    return out;
}

std::string decrypt(const std::string& cipher, int rails) {
    int n = cipher.size();
    auto rows = railPattern(n, rails);
    std::vector<int> order(n);
    std::iota(order.begin(), order.end(), 0);
    std::stable_sort(order.begin(), order.end(), [&](int a, int b) { return rows[a] < rows[b]; });
    std::string plain(n, ' ');
    for (int k = 0; k < n; k++) plain[order[k]] = cipher[k];
    return plain;
}

int main() {
    std::string c = encrypt("WEAREDISCOVEREDFLEEATONCE", 3);
    std::cout << c << '\\n';              // WECRLTEERDSOEEFEAOCAIVDEN
    std::cout << decrypt(c, 3) << '\\n';  // WEAREDISCOVEREDFLEEATONCE
}`}},

encoding:{name:'Encoding: hex and Base64',cat:'basics',
 blurb:'Encoding turns bytes into printable text so they survive email, URLs and JSON. It has no key and anyone can reverse it: encoding is not encryption.',
 cx:[['Hex size','2 × bytes','Each byte → two hex digits'],['Base64 size','≈ 4/3 × bytes','3 bytes → 4 characters'],['Time','O(n)',''],['Security','None','Fully reversible by anyone']],
 pts:['Hex writes each byte as two digits 0–9a–f. Simple, but doubles the size.','Base64 packs 3 bytes (24 bits) into 4 characters of 6 bits each, using A–Z, a–z, 0–9, + and /. “=” pads the last group.','Keys, hashes and ciphertexts are almost always shown as hex or Base64.','A classic mistake is “protecting” secrets with Base64. Decoding takes one line.'],
 pseudo:['procedure base64(bytes)','  for each group of 3 bytes (24 bits)','    split into four 6-bit numbers','    map each through the 64-symbol alphabet','  if 1 byte is left: 2 symbols + "=="','  if 2 bytes are left: 3 symbols + "="'],
 trace:[[0,'Encode “Man” (bytes 77, 97, 110).'],[2,'Bits: 01001101 01100001 01101110 → 010011 010110 000101 101110 = 19, 22, 5, 46.'],[3,'Alphabet lookup: 19 → T, 22 → W, 5 → F, 46 → u. “Man” becomes “TWFu”.'],[4,'“Ma” has only 2 bytes: “TWE=”. “M” alone: “TQ==”.'],[0,'Hex is simpler: “hi!” = 68 69 21.']],
 q:{q:'An app stores passwords as Base64. How secure is that?',o:['Very secure: Base64 is a cipher','As secure as hashing','Not at all: anyone can decode Base64 without a key','Secure if the passwords are long'],a:2,why:'Encoding is a public, keyless transformation. Passwords need a slow password hash such as Argon2.'},
 code:{
python:`ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

def base64_encode(data: bytes) -> str:
    out = []
    for i in range(0, len(data), 3):
        chunk = data[i:i + 3]
        n = int.from_bytes(chunk.ljust(3, b"\\0"), "big")      # 24 bits
        symbols = [ALPHABET[(n >> s) & 63] for s in (18, 12, 6, 0)]
        out += symbols[:len(chunk) + 1] + ["="] * (3 - len(chunk))
    return "".join(out)

msg = b"Many hands make light work."
print(base64_encode(msg))   # TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu
print(b"hi!".hex())          # 686921

import base64                # the standard library does the same
print(base64.b64decode("TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu").decode())`,
javascript:`const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function base64Encode(bytes) {
  let out = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const len = Math.min(3, bytes.length - i);
    const n = (bytes[i] << 16) | ((bytes[i + 1] || 0) << 8) | (bytes[i + 2] || 0);   // 24 bits
    for (let k = 0; k < 4; k++) out += k <= len ? ALPHABET[(n >> (18 - 6 * k)) & 63] : "=";
  }
  return out;
}

const msg = new TextEncoder().encode("Many hands make light work.");
console.log(base64Encode(msg));                    // TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu
console.log(Buffer.from("hi!").toString("hex"));   // 686921
console.log(Buffer.from("TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu", "base64").toString());`,
java:`import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HexFormat;

public class Encoding {
    static final String ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    static String base64Encode(byte[] data) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < data.length; i += 3) {
            int len = Math.min(3, data.length - i), n = 0;
            for (int k = 0; k < 3; k++) n = (n << 8) | (k < len ? data[i + k] & 0xff : 0);   // 24 bits
            for (int k = 0; k < 4; k++) out.append(k <= len ? ALPHABET.charAt((n >> (18 - 6 * k)) & 63) : '=');
        }
        return out.toString();
    }

    public static void main(String[] args) {
        byte[] msg = "Many hands make light work.".getBytes(StandardCharsets.UTF_8);
        System.out.println(base64Encode(msg));                    // TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu
        System.out.println(HexFormat.of().formatHex("hi!".getBytes(StandardCharsets.UTF_8)));   // 686921
        System.out.println(new String(Base64.getDecoder().decode("TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"),
                                      StandardCharsets.UTF_8));
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <cstdio>

const std::string ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

std::string base64Encode(const std::string& data) {
    std::string out;
    for (size_t i = 0; i < data.size(); i += 3) {
        size_t len = std::min<size_t>(3, data.size() - i);
        unsigned n = 0;
        for (size_t k = 0; k < 3; k++) n = (n << 8) | (k < len ? (unsigned char)data[i + k] : 0);   // 24 bits
        for (size_t k = 0; k < 4; k++) out += k <= len ? ALPHABET[(n >> (18 - 6 * k)) & 63] : '=';
    }
    return out;
}

int main() {
    std::cout << base64Encode("Many hands make light work.") << '\\n';   // TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu
    for (unsigned char c : std::string("hi!")) std::printf("%02x", c);   // 686921
    std::cout << '\\n';
}`}},

csprng:{name:'Secure random numbers',cat:'basics',
 blurb:'Keys, nonces and salts must be unpredictable. Ordinary random functions are designed for simulations and games, not secrecy; always use your platform’s cryptographically secure generator.',
 cx:[['Source','OS entropy pool','/dev/urandom, getrandom(), BCryptGenRandom'],['Speed','Fast','Hundreds of MB/s'],['Math.random / rand()','Predictable','State can be recovered from outputs'],['Key size rule','128+ bits','Never derive keys from timestamps']],
 pts:['A CSPRNG’s output can’t be predicted even by someone who has seen earlier outputs.','Python random, JavaScript Math.random, Java Random and C rand() are not secure; their internal state can be reconstructed.','Use secrets / os.urandom, crypto.randomBytes, SecureRandom, or OpenSSL RAND_bytes.','Many real breaches came from weak randomness: the 2008 Debian OpenSSL bug left only 32,768 possible SSH keys.'],
 pseudo:['procedure secureToken(nBytes)','  bytes ← OS cryptographic RNG(nBytes)   // never Math.random()','  return hex(bytes)','procedure uniformBelow(n)','  // reject values in the last partial block to avoid bias','  repeat r ← random 32-bit value until r < 2³² − (2³² mod n)','  return r mod n'],
 trace:[[1,'secureToken(16) asks the operating system for 16 bytes of entropy: 128 bits.'],[2,'Shown as 32 hex characters, e.g. a session ID or password-reset token.'],[4,'Taking random % 6 for a die roll is slightly biased when 2³² isn’t a multiple of 6.'],[5,'Rejection sampling discards the few values that cause the bias.'],[6,'Libraries do this for you: secrets.randbelow, crypto.randomInt, SecureRandom.nextInt.']],
 q:{q:'Which is safe for generating a password-reset token?',o:['Math.random()','The current timestamp in milliseconds','crypto.randomBytes(32)','A hash of the user’s email'],a:2,why:'Only a cryptographically secure generator gives unpredictable output; the others can be guessed or reproduced.'},
 code:{
python:`import secrets

token = secrets.token_hex(16)          # 16 random bytes -> 32 hex characters
print(len(token))                      # 32
die = secrets.randbelow(6) + 1         # unbiased 1..6
print(1 <= die <= 6)                   # True
# Never use the random module for secrets: its state can be recovered.`,
javascript:`const crypto = require("crypto");

const token = crypto.randomBytes(16).toString("hex");   // 32 hex characters
console.log(token.length);                             // 32
const die = crypto.randomInt(1, 7);                    // unbiased 1..6
console.log(die >= 1 && die <= 6);                     // true
// Browsers: crypto.getRandomValues(new Uint8Array(16)). Never Math.random().`,
java:`import java.security.SecureRandom;
import java.util.HexFormat;

public class SecureRandomDemo {
    public static void main(String[] args) {
        SecureRandom rng = new SecureRandom();
        byte[] bytes = new byte[16];
        rng.nextBytes(bytes);
        String token = HexFormat.of().formatHex(bytes);
        System.out.println(token.length());          // 32
        int die = rng.nextInt(6) + 1;                // unbiased 1..6
        System.out.println(die >= 1 && die <= 6);    // true
        // java.util.Random is NOT secure.
    }
}`,
cpp:`// Compile with: g++ rng.cpp -lcrypto
#include <openssl/rand.h>
#include <cstdio>
#include <cstdint>
#include <iostream>

uint32_t uniformBelow(uint32_t n) {             // rejection sampling: no modulo bias
    uint32_t limit = UINT32_MAX - (UINT32_MAX % n), r;
    do { RAND_bytes(reinterpret_cast<unsigned char*>(&r), sizeof r); } while (r >= limit);
    return r % n;
}

int main() {
    unsigned char bytes[16];
    if (RAND_bytes(bytes, sizeof bytes) != 1) return 1;   // OS-seeded CSPRNG
    char hex[33];
    for (int i = 0; i < 16; i++) std::snprintf(hex + 2 * i, 3, "%02x", bytes[i]);
    std::cout << std::string(hex).size() << '\\n';         // 32
    uint32_t die = uniformBelow(6) + 1;
    std::cout << std::boolalpha << (die >= 1 && die <= 6) << '\\n';   // true
    // rand() and std::mt19937 are NOT secure.
}`}},

hashtable:{name:'Hash tables & FNV-1a',cat:'nchash',
 blurb:'A non-cryptographic hash turns a key into a bucket index so dictionaries and sets can find items in O(1) on average. Speed matters here, not secrecy.',
 cx:[['Lookup / insert (average)','O(1)','With a good hash and load factor < ~0.75'],['Worst case','O(n)','Every key in one bucket'],['Hash cost','O(key length)','FNV-1a: one XOR and one multiply per byte'],['Extra space','O(n)','Buckets plus entries']],
 pts:['index = hash(key) mod number of buckets. Different keys landing in the same bucket is a collision.','Separate chaining stores a small list per bucket; open addressing probes for the next free slot.','When the table gets too full it doubles in size and rehashes every key (amortized O(1)).','Non-crypto hashes (FNV, MurmurHash, xxHash) are fast but easy to attack; languages add random seeds so attackers can’t force collisions (hash flooding).'],
 pseudo:['procedure fnv1a(bytes)   // 32-bit','  h ← 2166136261','  for each byte b','    h ← h XOR b','    h ← (h × 16777619) mod 2³²','  return h','put(key, value): bucket[fnv1a(key) mod m].append((key, value))','get(key): scan bucket[fnv1a(key) mod m] for key'],
 trace:[[1,'Hash “cat”: start from the FNV offset basis 2166136261.'],[4,'For each byte: XOR it in, then multiply by the FNV prime and keep the low 32 bits.'],[6,'fnv1a(“hello”) = 0x4f9f2cab. With 8 buckets, “hello” goes to bucket 0x4f9f2cab mod 8 = 3.'],[6,'put(“apple”, 3), put(“pear”, 5): each lands in a bucket chosen by its hash.'],[7,'get(“pear”) hashes again, jumps to that one bucket, and scans its short list.']],
 q:{q:'Why do Python and Java randomize string hashing per process?',o:['To make dictionaries faster','So attackers can’t craft many keys that collide and slow the table to O(n)','To encrypt keys','To save memory'],a:1,why:'Predictable hashes let an attacker send thousands of colliding keys (hash flooding), a denial-of-service attack.'},
 code:{
python:`def fnv1a(data: bytes) -> int:
    h = 2166136261
    for b in data:
        h ^= b
        h = (h * 16777619) & 0xFFFFFFFF      # keep 32 bits
    return h

class HashMap:
    def __init__(self, buckets=8):
        self.buckets = [[] for _ in range(buckets)]

    def _bucket(self, key):
        return self.buckets[fnv1a(key.encode()) % len(self.buckets)]

    def put(self, key, value):
        b = self._bucket(key)
        for i, (k, _) in enumerate(b):
            if k == key:
                b[i] = (key, value)
                return
        b.append((key, value))

    def get(self, key):
        for k, v in self._bucket(key):
            if k == key:
                return v
        return None

print(hex(fnv1a(b"hello")))           # 0x4f9f2cab
m = HashMap()
m.put("apple", 3); m.put("pear", 5); m.put("apple", 4)
print(m.get("apple"), m.get("pear"), m.get("kiwi"))   # 4 5 None`,
javascript:`function fnv1a(str) {
  let h = 2166136261;
  for (const b of Buffer.from(str)) {
    h ^= b;
    h = Math.imul(h, 16777619) >>> 0;      // 32-bit multiply
  }
  return h >>> 0;
}

class HashMap {
  constructor(buckets = 8) { this.buckets = Array.from({ length: buckets }, () => []); }
  bucket(key) { return this.buckets[fnv1a(key) % this.buckets.length]; }
  put(key, value) {
    const b = this.bucket(key), e = b.find(e => e[0] === key);
    if (e) e[1] = value; else b.push([key, value]);
  }
  get(key) { const e = this.bucket(key).find(e => e[0] === key); return e ? e[1] : null; }
}

console.log("0x" + fnv1a("hello").toString(16));   // 0x4f9f2cab
const m = new HashMap();
m.put("apple", 3); m.put("pear", 5); m.put("apple", 4);
console.log(m.get("apple"), m.get("pear"), m.get("kiwi"));   // 4 5 null`,
java:`import java.nio.charset.StandardCharsets;
import java.util.*;

public class FnvHashMap {
    static int fnv1a(String s) {
        int h = 0x811c9dc5;                                  // 2166136261
        for (byte b : s.getBytes(StandardCharsets.UTF_8)) {
            h ^= (b & 0xff);
            h *= 16777619;                                   // int overflow = mod 2^32
        }
        return h;
    }

    private final List<List<Map.Entry<String, Integer>>> buckets = new ArrayList<>();

    FnvHashMap(int n) { for (int i = 0; i < n; i++) buckets.add(new ArrayList<>()); }

    private List<Map.Entry<String, Integer>> bucket(String key) {
        return buckets.get(Integer.remainderUnsigned(fnv1a(key), buckets.size()));
    }

    void put(String key, int value) {
        for (Map.Entry<String, Integer> e : bucket(key)) if (e.getKey().equals(key)) { e.setValue(value); return; }
        bucket(key).add(new AbstractMap.SimpleEntry<>(key, value));
    }

    Integer get(String key) {
        for (Map.Entry<String, Integer> e : bucket(key)) if (e.getKey().equals(key)) return e.getValue();
        return null;
    }

    public static void main(String[] args) {
        System.out.println("0x" + Integer.toHexString(fnv1a("hello")));   // 0x4f9f2cab
        FnvHashMap m = new FnvHashMap(8);
        m.put("apple", 3); m.put("pear", 5); m.put("apple", 4);
        System.out.println(m.get("apple") + " " + m.get("pear") + " " + m.get("kiwi"));   // 4 5 null
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <vector>
#include <optional>
#include <cstdint>

uint32_t fnv1a(const std::string& s) {
    uint32_t h = 2166136261u;
    for (unsigned char b : s) {
        h ^= b;
        h *= 16777619u;                       // unsigned overflow = mod 2^32
    }
    return h;
}

class HashMap {
    std::vector<std::vector<std::pair<std::string, int>>> buckets;
    auto& bucket(const std::string& key) { return buckets[fnv1a(key) % buckets.size()]; }
public:
    explicit HashMap(size_t n = 8) : buckets(n) {}
    void put(const std::string& key, int value) {
        for (auto& e : bucket(key)) if (e.first == key) { e.second = value; return; }
        bucket(key).push_back({key, value});
    }
    std::optional<int> get(const std::string& key) {
        for (auto& e : bucket(key)) if (e.first == key) return e.second;
        return std::nullopt;
    }
};

int main() {
    std::cout << std::hex << "0x" << fnv1a("hello") << std::dec << '\\n';   // 0x4f9f2cab
    HashMap m;
    m.put("apple", 3); m.put("pear", 5); m.put("apple", 4);
    std::cout << *m.get("apple") << ' ' << *m.get("pear") << ' '
              << (m.get("kiwi") ? "found" : "null") << '\\n';            // 4 5 null
}`}},

crc32:{name:'CRC-32 checksum',cat:'nchash',
 blurb:'A cyclic redundancy check detects accidental corruption in files and network packets. It is great at catching random bit errors and useless against a deliberate attacker.',
 cx:[['Time','O(n)','Faster with a 256-entry lookup table or CPU instructions'],['Output','32 bits',''],['Detects','All 1- and 2-bit errors, bursts ≤ 32 bits','Within practical lengths'],['Security','None','Anyone can forge a matching CRC']],
 pts:['Mathematically, CRC treats the data as a polynomial over GF(2) and keeps the remainder after dividing by a fixed generator polynomial.','Used in Ethernet, ZIP, PNG, gzip and SATA.','Because CRC is linear, an attacker can modify data and adjust a few bytes to keep the same CRC.','For tamper detection use a MAC (HMAC); for integrity against attackers use a cryptographic hash.'],
 pseudo:['procedure crc32(bytes)','  crc ← 0xFFFFFFFF','  for each byte b','    crc ← crc XOR b','    repeat 8 times','      if crc is odd: crc ← (crc >> 1) XOR 0xEDB88320','      else: crc ← crc >> 1','  return crc XOR 0xFFFFFFFF'],
 trace:[[1,'The standard check input is the ASCII string “123456789”.'],[3,'Each byte is XORed into the low bits of the running remainder.'],[5,'Eight shift steps per byte divide by the reversed polynomial 0xEDB88320.'],[7,'Final XOR gives 0xCBF43926, the published check value for CRC-32.'],[0,'Flip any single bit of the input and the CRC changes, which is how corruption is caught.']],
 q:{q:'A download site lists a CRC-32 for each file to stop attackers swapping in malware. Is that enough?',o:['Yes, CRC-32 is a secure hash','No: an attacker can craft a malicious file with the same CRC','Yes, if the file is large','Only if the CRC is in hex'],a:1,why:'CRC detects accidents, not attacks. Publish a SHA-256 hash, ideally with a signature.'},
 code:{
python:`def crc32(data: bytes) -> int:
    crc = 0xFFFFFFFF
    for b in data:
        crc ^= b
        for _ in range(8):
            crc = (crc >> 1) ^ 0xEDB88320 if crc & 1 else crc >> 1
    return crc ^ 0xFFFFFFFF

print(hex(crc32(b"123456789")))   # 0xcbf43926

import zlib                        # the built-in version agrees
print(hex(zlib.crc32(b"123456789")))`,
javascript:`function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

console.log("0x" + crc32(Buffer.from("123456789")).toString(16));   // 0xcbf43926`,
java:`import java.nio.charset.StandardCharsets;
import java.util.zip.CRC32;

public class Crc32 {
    static long crc32(byte[] data) {
        int crc = 0xFFFFFFFF;
        for (byte b : data) {
            crc ^= (b & 0xff);
            for (int k = 0; k < 8; k++) crc = (crc & 1) != 0 ? (crc >>> 1) ^ 0xEDB88320 : crc >>> 1;
        }
        return (crc ^ 0xFFFFFFFF) & 0xFFFFFFFFL;
    }

    public static void main(String[] args) {
        byte[] data = "123456789".getBytes(StandardCharsets.US_ASCII);
        System.out.println("0x" + Long.toHexString(crc32(data)));    // 0xcbf43926
        CRC32 builtin = new CRC32();                                  // java.util.zip agrees
        builtin.update(data);
        System.out.println("0x" + Long.toHexString(builtin.getValue()));
    }
}`,
cpp:`#include <iostream>
#include <string>
#include <cstdint>

uint32_t crc32(const std::string& data) {
    uint32_t crc = 0xFFFFFFFFu;
    for (unsigned char b : data) {
        crc ^= b;
        for (int k = 0; k < 8; k++) crc = (crc & 1) ? (crc >> 1) ^ 0xEDB88320u : crc >> 1;
    }
    return crc ^ 0xFFFFFFFFu;
}

int main() {
    std::cout << std::hex << "0x" << crc32("123456789") << '\\n';   // 0xcbf43926
}`}}
});
