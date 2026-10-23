/* ===== Crypto library part B: cryptographic hashes, MACs, password hashing & KDFs ===== */
const CPP_HEX=`std::string hex(const unsigned char* p, size_t n) {
    static const char* d = "0123456789abcdef";
    std::string s;
    for (size_t i = 0; i < n; i++) { s += d[p[i] >> 4]; s += d[p[i] & 15]; }
    return s;
}`;
const hashCode=(algo,pyName,nodeName,javaName,cppEvp,input,expected,comment)=>({
python:`import hashlib

digest = hashlib.${pyName}(b"${input}").hexdigest()
print(digest)   # ${expected}${comment?'\n'+comment.replace(/^/gm,'# '):''}`,
javascript:`const crypto = require("crypto");

const digest = crypto.createHash("${nodeName}").update("${input}").digest("hex");
console.log(digest);   // ${expected}${comment?'\n'+comment.replace(/^/gm,'// '):''}`,
java:`import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

public class ${algo}Demo {
    public static void main(String[] args) throws Exception {
        MessageDigest md = MessageDigest.getInstance("${javaName}");
        byte[] digest = md.digest("${input}".getBytes(StandardCharsets.UTF_8));
        System.out.println(HexFormat.of().formatHex(digest));   // ${expected}
    }
}`,
cpp:`// Compile with: g++ hash.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    std::string msg = "${input}";
    unsigned char out[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    EVP_Digest(msg.data(), msg.size(), out, &len, ${cppEvp}(), nullptr);
    std::cout << hex(out, len) << '\\n';   // ${expected}
}`});

Object.assign(ALGOS,{

md5:{name:'MD5',cat:'hashes',
 blurb:'A 128-bit hash from 1992 that was the internet’s default for a decade. Collisions can now be found in seconds on a laptop, so it must never be used for security.',
 cx:[['Output','128 bits',''],['Speed','Very fast','Which also makes password cracking fast'],['Collision resistance','Broken','Practical collisions since 2004 (Wang et al.)'],['Status','Do not use for security','Still OK as a non-security checksum']],
 pts:['Built on the Merkle–Damgård construction: pad the message, split it into 512-bit blocks, and fold each block into a 128-bit state.','In 2008 researchers used MD5 collisions to forge a trusted certificate authority certificate; the Flame malware did the same in 2012.','Unsalted MD5 password databases are cracked at billions of guesses per second.','Replace with SHA-256, SHA-3 or BLAKE2/3; for passwords use Argon2, scrypt or bcrypt.'],
 pseudo:['procedure MD5(message)','  pad: append 1 bit, zeros, then 64-bit length → multiple of 512 bits','  (A, B, C, D) ← four fixed 32-bit constants','  for each 512-bit block','    64 operations in 4 rounds of 16, mixing the block with F, G, H, I functions','    add the results into (A, B, C, D)','  return A ‖ B ‖ C ‖ D   // 128 bits'],
 trace:[[1,'“hello” (5 bytes) is padded to one 512-bit block.'],[4,'Four rounds of 16 steps scramble the block into the state.'],[6,'MD5(“hello”) = 5d41402abc4b2a76b9719d911017c592.'],[0,'MD5(“”) = d41d8cd98f00b204e9800998ecf8427e. You will see this value in logs and databases.'],[0,'Two different files with the same MD5 can be generated in seconds, so MD5 proves nothing about authenticity.']],
 q:{q:'Is MD5 acceptable for storing user passwords?',o:['Yes, if you add a salt','No: it is broken for collisions and far too fast for passwords','Yes, MD5 is a secure hash','Only for short passwords'],a:1,why:'Even salted, MD5 is fast enough for billions of guesses per second. Use Argon2id, scrypt or bcrypt.'},
 code:hashCode('Md5','md5','md5','MD5','EVP_md5','hello','5d41402abc4b2a76b9719d911017c592','MD5 is broken: use it only for non-security checksums.')},

sha1:{name:'SHA-1',cat:'hashes',
 blurb:'A 160-bit hash designed by the NSA in 1995. Google and CWI produced the first real collision (“SHAttered”) in 2017; it has been phased out of TLS certificates and Git is migrating away.',
 cx:[['Output','160 bits',''],['Generic collision cost','2⁸⁰','Birthday bound'],['Actual collision cost','≈ 2⁶³','SHAttered (2017); chosen-prefix in 2020'],['Status','Deprecated','Don’t use for signatures or new designs']],
 pts:['Same Merkle–Damgård structure as MD5 and SHA-2: 512-bit blocks, 80 rounds, 160-bit state.','The 2017 attack produced two different PDFs with the same SHA-1 using about 6,500 CPU-years of computation.','HMAC-SHA1 is still considered safe today, because HMAC doesn’t rely on collision resistance, but new systems should use SHA-256.','Git originally identified objects by SHA-1 and has added SHA-256 support.'],
 pseudo:['procedure SHA1(message)','  pad to a multiple of 512 bits, ending with the 64-bit length','  H0..H4 ← five fixed 32-bit constants','  for each 512-bit block','    expand 16 words into 80 words W[0..79]','    80 rounds: mix W[t] using rotations, Ch / Parity / Maj functions','    add the result into H0..H4','  return H0 ‖ H1 ‖ H2 ‖ H3 ‖ H4   // 160 bits'],
 trace:[[1,'“hello” is padded into one block.'],[4,'The 16 message words are expanded to 80 words with XOR and rotation.'],[5,'80 rounds of mixing update the five state words.'],[7,'SHA-1(“hello”) = aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d.'],[0,'SHAttered: two different PDFs, one SHA-1. Signatures over SHA-1 are no longer trustworthy.']],
 q:{q:'Why can a 160-bit hash have collisions found in fewer than 2⁸⁰ operations?',o:['Hashes always have short cycles','Cryptanalysis found structural weaknesses that beat the generic birthday bound','160 bits is really 80 bits','Quantum computers'],a:1,why:'2⁸⁰ is the generic birthday attack; SHA-1’s internal structure allowed a much cheaper differential attack.'},
 code:hashCode('Sha1','sha1','sha1','SHA-1','EVP_sha1','hello','aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d','Deprecated: prefer SHA-256 or SHA-3.')},

sha3:{name:'SHA-3 (Keccak)',cat:'hashes',
 blurb:'The 2015 NIST standard built on a completely different design from SHA-2: a “sponge” that absorbs input into a large state and squeezes output out of it.',
 cx:[['Output','224 / 256 / 384 / 512 bits','SHAKE128/256 give any length'],['State','1600 bits','24 rounds of the Keccak-f permutation'],['Security','Strong','No practical attacks'],['Speed','Similar to SHA-2 in software','Very fast in hardware']],
 pts:['Chosen in a public 5-year competition (won by Keccak in 2012) as a backup in case SHA-2 is ever broken.','The sponge: XOR each input block into the “rate” part of the state, apply the permutation, repeat; then read output from the rate part.','Not vulnerable to length-extension attacks, unlike SHA-256, so keyed hashing is simpler.','SHAKE (extendable-output functions) and the post-quantum standards ML-KEM and ML-DSA are built on Keccak.'],
 pseudo:['procedure SHA3-256(message)','  state[1600 bits] ← 0; rate r ← 1088 bits','  pad message with 0x06 … 0x80 to a multiple of r','  for each r-bit block   // absorb','    state[0..r) ← state[0..r) XOR block','    state ← Keccak-f[1600](state)   // 24 rounds of θ ρ π χ ι','  return the first 256 bits of state   // squeeze'],
 trace:[[1,'The 1600-bit state is split into a 1088-bit rate and a 512-bit capacity that input never touches directly.'],[4,'“hello” fits in one block: XOR it (padded) into the rate.'],[5,'24 rounds of five steps (θ, ρ, π, χ, ι) mix every bit into every other bit.'],[6,'SHA3-256(“hello”) = 3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392.'],[1,'The hidden capacity is what gives sponge constructions their security margin.']],
 q:{q:'What is one practical advantage SHA-3 has over SHA-256?',o:['It is always faster in software','It is immune to length-extension attacks','It produces shorter hashes','It needs no padding'],a:1,why:'Sponge outputs don’t reveal the full internal state, so you can’t continue hashing from a published digest.'},
 code:hashCode('Sha3','sha3_256','sha3-256','SHA3-256','EVP_sha3_256','hello','3338be694f50c5f338814986cdf0686453a888b84f424d792af4b9202398f392','')},

blake2:{name:'BLAKE2',cat:'hashes',
 blurb:'A fast, secure hash derived from a SHA-3 finalist. BLAKE2b is faster than MD5 on 64-bit CPUs while being as strong as SHA-3, and supports keys and custom output lengths.',
 cx:[['Output','1–64 bytes (BLAKE2b)','BLAKE2s: 1–32 bytes for 32-bit CPUs'],['Speed','≈ 1 GB/s per core','BLAKE3 is several times faster again'],['Security','Strong','No practical attacks'],['Built-in key','Yes','Can act as a MAC without HMAC']],
 pts:['Based on the ChaCha stream cipher’s core (add, rotate, XOR), so it is quick in software.','Used by Argon2 internally, by WireGuard, and by many package managers and file-sync tools.','A key parameter turns it into a MAC directly; personalization strings separate different uses.','BLAKE3 (2020) adds a Merkle tree structure for parallel hashing of large files.'],
 pseudo:['procedure BLAKE2b(message, outLen, key?)','  h[0..7] ← IV XOR parameter block (outLen, keyLen, …)','  if key: prepend key padded to 128 bytes','  for each 128-byte block','    v ← h ‖ IV, mixed with a byte counter and final-block flag','    12 rounds of G(a, b, c, d): add, XOR, rotate on columns then diagonals','    h ← h XOR v[0..7] XOR v[8..15]','  return first outLen bytes of h'],
 trace:[[1,'The output length is mixed into the initial state, so BLAKE2b-256 and BLAKE2b-512 are unrelated.'],[4,'“hello” fits in one (final) 128-byte block.'],[5,'12 rounds of the G function (4 column steps + 4 diagonal steps each).'],[6,'The two halves of the working state are folded back into h.'],[7,'BLAKE2b-512(“hello”) starts e4cfa39a3d37be31…']],
 q:{q:'BLAKE2 accepts a key directly. What does that let you build without HMAC?',o:['A cipher','A message authentication code (MAC)','A digital signature','A random number generator only'],a:1,why:'Keyed BLAKE2 is a secure MAC; SHA-256 needs the HMAC wrapper to do the same safely.'},
 code:{
python:`import hashlib

digest = hashlib.blake2b(b"hello", digest_size=64).hexdigest()
print(digest[:16])   # e4cfa39a3d37be31

mac = hashlib.blake2b(b"message", key=b"secret key", digest_size=32).hexdigest()   # keyed mode = MAC
print(len(mac))      # 64 hex chars`,
javascript:`const crypto = require("crypto");

const digest = crypto.createHash("blake2b512").update("hello").digest("hex");
console.log(digest.slice(0, 16));   // e4cfa39a3d37be31
// Node exposes BLAKE2b-512 and BLAKE2s-256 (unkeyed). For keyed BLAKE2, use a library such as blakejs.`,
java:`// Needs BouncyCastle (bcprov) on the classpath.
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import org.bouncycastle.crypto.digests.Blake2bDigest;

public class Blake2Demo {
    public static void main(String[] args) {
        byte[] msg = "hello".getBytes(StandardCharsets.UTF_8);
        Blake2bDigest d = new Blake2bDigest(512);
        d.update(msg, 0, msg.length);
        byte[] out = new byte[64];
        d.doFinal(out, 0);
        System.out.println(HexFormat.of().formatHex(out).substring(0, 16));   // e4cfa39a3d37be31
    }
}`,
cpp:`// Compile with: g++ blake2.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    std::string msg = "hello";
    unsigned char out[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    EVP_Digest(msg.data(), msg.size(), out, &len, EVP_blake2b512(), nullptr);
    std::cout << hex(out, len).substr(0, 16) << '\\n';   // e4cfa39a3d37be31
}`}},

merkle:{name:'Merkle tree',cat:'hashes',
 blurb:'Hash data in pairs, level by level, until one root hash remains. The root commits to every item, and any single item can be proven with only log₂ n hashes.',
 cx:[['Build','O(n)','n − 1 internal hashes'],['Proof size','O(log n)','One sibling hash per level'],['Verify','O(log n)',''],['Used in','Git, Bitcoin, Certificate Transparency, IPFS','']],
 pts:['Leaves are hashes of data blocks; each parent is the hash of its two children concatenated.','Change one byte anywhere and the root changes.','A membership proof is the list of sibling hashes on the path from a leaf to the root.','Real designs prefix leaf and node hashes differently (0x00 vs 0x01) to prevent second-preimage tricks; the demo below keeps it simple.'],
 pseudo:['procedure merkleRoot(items)','  level ← [H(item) for each item]','  while |level| > 1','    if |level| is odd: duplicate the last hash','    level ← [H(level[i] ‖ level[i+1]) for i = 0, 2, 4, …]','  return level[0]','verify(leaf, proof, root): fold H(… H(leaf ‖ sibling) …) and compare with root'],
 trace:[[1,'Items “a”, “b”, “c”, “d” become leaves H(a), H(b), H(c), H(d) with SHA-256.'],[4,'Level 2: H(H(a) ‖ H(b)) and H(H(c) ‖ H(d)).'],[5,'Level 3: one hash of those two. That is the root.'],[6,'To prove “c” is included, send H(d) and H(H(a) ‖ H(b)): just 2 hashes for 4 items.'],[0,'A million items need only 20 hashes per proof.']],
 q:{q:'How many hashes does a membership proof need in a Merkle tree of 1,048,576 leaves?',o:['1','20','1,024','1,048,576'],a:1,why:'One sibling per level, and log₂(2²⁰) = 20 levels.'},
 code:{
python:`import hashlib

def H(b: bytes) -> bytes:
    return hashlib.sha256(b).digest()

def merkle_root(items):
    level = [H(x) for x in items]
    while len(level) > 1:
        if len(level) % 2:
            level.append(level[-1])           # duplicate the last hash on odd levels
        level = [H(level[i] + level[i + 1]) for i in range(0, len(level), 2)]
    return level[0]

print(merkle_root([b"a", b"b", b"c", b"d"]).hex())
# 14ede5e8e97ad9372327728f5099b95604a39593cac3bd38a343ad76205213e7`,
javascript:`const crypto = require("crypto");
const H = b => crypto.createHash("sha256").update(b).digest();

function merkleRoot(items) {
  let level = items.map(x => H(Buffer.from(x)));
  while (level.length > 1) {
    if (level.length % 2) level.push(level[level.length - 1]);   // duplicate the last on odd levels
    const next = [];
    for (let i = 0; i < level.length; i += 2) next.push(H(Buffer.concat([level[i], level[i + 1]])));
    level = next;
  }
  return level[0];
}

console.log(merkleRoot(["a", "b", "c", "d"]).toString("hex"));
// 14ede5e8e97ad9372327728f5099b95604a39593cac3bd38a343ad76205213e7`,
java:`import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;

public class Merkle {
    static byte[] H(byte[]... parts) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        for (byte[] p : parts) md.update(p);
        return md.digest();
    }

    static byte[] merkleRoot(List<String> items) throws Exception {
        List<byte[]> level = new ArrayList<>();
        for (String s : items) level.add(H(s.getBytes(StandardCharsets.UTF_8)));
        while (level.size() > 1) {
            if (level.size() % 2 == 1) level.add(level.get(level.size() - 1));
            List<byte[]> next = new ArrayList<>();
            for (int i = 0; i < level.size(); i += 2) next.add(H(level.get(i), level.get(i + 1)));
            level = next;
        }
        return level.get(0);
    }

    public static void main(String[] args) throws Exception {
        System.out.println(HexFormat.of().formatHex(merkleRoot(List.of("a", "b", "c", "d"))));
        // 14ede5e8e97ad9372327728f5099b95604a39593cac3bd38a343ad76205213e7
    }
}`,
cpp:`// Compile with: g++ merkle.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>
#include <vector>

${CPP_HEX}

std::string H(const std::string& data) {
    unsigned char out[32];
    unsigned int len = 0;
    EVP_Digest(data.data(), data.size(), out, &len, EVP_sha256(), nullptr);
    return std::string(reinterpret_cast<char*>(out), len);
}

std::string merkleRoot(const std::vector<std::string>& items) {
    std::vector<std::string> level;
    for (auto& x : items) level.push_back(H(x));
    while (level.size() > 1) {
        if (level.size() % 2) level.push_back(level.back());
        std::vector<std::string> next;
        for (size_t i = 0; i < level.size(); i += 2) next.push_back(H(level[i] + level[i + 1]));
        level = next;
    }
    return level[0];
}

int main() {
    std::string root = merkleRoot({"a", "b", "c", "d"});
    std::cout << hex(reinterpret_cast<const unsigned char*>(root.data()), root.size()) << '\\n';
    // 14ede5e8e97ad9372327728f5099b95604a39593cac3bd38a343ad76205213e7
}`}},

hmac:{name:'HMAC',cat:'mac',
 blurb:'A message authentication code built from a hash and a secret key. Only someone with the key can produce a valid tag, so the receiver knows the message is genuine and unmodified.',
 cx:[['Time','O(n)','Two hash passes'],['Tag size','Hash size','32 bytes for HMAC-SHA256; may be truncated to ≥ 16'],['Security','Strong','Even HMAC-MD5 has no practical forgery, though avoid it'],['Verify','Constant-time compare','Prevents timing attacks']],
 pts:['HMAC(K, m) = H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ m)). The nesting defeats the length-extension weakness of SHA-256.','Hashing alone gives integrity against accidents; a MAC gives integrity against attackers who don’t know the key.','Used for API request signing (AWS SigV4), JSON Web Tokens (HS256), cookies, and inside TLS and HKDF.','Compare tags with hmac.compare_digest / crypto.timingSafeEqual / MessageDigest.isEqual / CRYPTO_memcmp.'],
 pseudo:['procedure HMAC(K, m)   // block size B = 64 bytes for SHA-256','  if |K| > B: K ← H(K)','  K ← K padded with zeros to B bytes','  inner ← H((K XOR 0x36…36) ‖ m)','  return H((K XOR 0x5c…5c) ‖ inner)','verify(K, m, tag): constantTimeEqual(HMAC(K, m), tag)'],
 trace:[[0,'Key “key”, message “The quick brown fox jumps over the lazy dog”.'],[2,'The key is padded with zeros to 64 bytes.'],[3,'Inner hash: SHA-256 of (key ⊕ 0x36 repeated) followed by the message.'],[4,'Outer hash over (key ⊕ 0x5c repeated) ‖ inner gives f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8.'],[5,'The receiver recomputes the tag and compares in constant time; a single flipped bit gives a completely different tag.']],
 q:{q:'Why not just send SHA-256(key ‖ message) as a tag?',o:['It is too slow','Length extension lets an attacker append data and compute a valid tag without the key','SHA-256 can’t take keys','It is longer than HMAC'],a:1,why:'SHA-256’s output reveals its internal state, so an attacker can keep hashing from there. HMAC’s nested structure prevents this.'},
 code:{
python:`import hashlib
import hmac

key = b"key"
msg = b"The quick brown fox jumps over the lazy dog"
tag = hmac.new(key, msg, hashlib.sha256).hexdigest()
print(tag)   # f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8

received = tag
print(hmac.compare_digest(received, hmac.new(key, msg, hashlib.sha256).hexdigest()))   # True (constant time)`,
javascript:`const crypto = require("crypto");

const key = "key", msg = "The quick brown fox jumps over the lazy dog";
const tag = crypto.createHmac("sha256", key).update(msg).digest();
console.log(tag.toString("hex"));   // f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8

const expected = crypto.createHmac("sha256", key).update(msg).digest();
console.log(crypto.timingSafeEqual(tag, expected));   // true (constant time)`,
java:`import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class HmacDemo {
    static byte[] hmac(byte[] key, byte[] msg) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(msg);
    }

    public static void main(String[] args) throws Exception {
        byte[] key = "key".getBytes(StandardCharsets.UTF_8);
        byte[] msg = "The quick brown fox jumps over the lazy dog".getBytes(StandardCharsets.UTF_8);
        byte[] tag = hmac(key, msg);
        System.out.println(HexFormat.of().formatHex(tag));
        // f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
        System.out.println(MessageDigest.isEqual(tag, hmac(key, msg)));   // true (constant time)
    }
}`,
cpp:`// Compile with: g++ hmac.cpp -lcrypto
#include <openssl/hmac.h>
#include <openssl/crypto.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    std::string key = "key", msg = "The quick brown fox jumps over the lazy dog";
    unsigned char tag[EVP_MAX_MD_SIZE], again[EVP_MAX_MD_SIZE];
    unsigned int len = 0;
    HMAC(EVP_sha256(), key.data(), key.size(), (const unsigned char*)msg.data(), msg.size(), tag, &len);
    std::cout << hex(tag, len) << '\\n';
    // f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
    HMAC(EVP_sha256(), key.data(), key.size(), (const unsigned char*)msg.data(), msg.size(), again, &len);
    std::cout << std::boolalpha << (CRYPTO_memcmp(tag, again, len) == 0) << '\\n';   // true
}`}},

pbkdf2:{name:'PBKDF2',cat:'kdf',
 blurb:'Password-Based Key Derivation Function 2 runs HMAC thousands of times with a salt, making each password guess deliberately slow. The most widely available password hash.',
 cx:[['Time','O(iterations)','OWASP 2023: 600,000 iterations for PBKDF2-HMAC-SHA256'],['Memory','Tiny','So GPUs and ASICs can attack it cheaply'],['Salt','≥ 16 random bytes','Unique per password'],['Status','Acceptable (FIPS approved)','Prefer Argon2id when available']],
 pts:['A salt makes identical passwords hash differently and defeats precomputed rainbow tables.','The iteration count is a work factor: raise it as hardware gets faster.','Because PBKDF2 needs almost no memory, attackers parallelize it on GPUs; memory-hard functions (scrypt, Argon2) resist that.','Store the algorithm, iteration count, salt and hash together so you can upgrade later.'],
 pseudo:['procedure PBKDF2(password, salt, iterations, dkLen)','  for each output block i = 1, 2, …','    U ← HMAC(password, salt ‖ INT(i))','    T ← U','    repeat iterations − 1 times','      U ← HMAC(password, U); T ← T XOR U','    append T to the output','  return first dkLen bytes'],
 trace:[[0,'Hash the password “correct horse” with a random 16-byte salt.'],[2,'The first HMAC mixes in the salt and block number.'],[5,'599,999 more HMACs, XOR-ed together: about 0.2 s on a laptop.'],[0,'An attacker trying 10 billion passwords pays the same cost for every guess.'],[0,'Store “pbkdf2-sha256$600000$<salt>$<hash>” and recompute it to verify.']],
 q:{q:'What does the salt in password hashing prevent?',o:['Slow logins','Precomputed rainbow tables and identical hashes for identical passwords','Brute force entirely','Users choosing weak passwords'],a:1,why:'With a unique salt, attackers must attack each password separately and can’t reuse precomputed tables.'},
 code:{
python:`import hashlib
import hmac
import os

def hash_password(password: str, iterations: int = 600_000):
    salt = os.urandom(16)                     # unique random salt per password
    dk = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return salt, dk

def verify(password: str, salt: bytes, dk: bytes, iterations: int = 600_000) -> bool:
    attempt = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, iterations)
    return hmac.compare_digest(attempt, dk)   # constant-time comparison

salt, dk = hash_password("correct horse")
print(len(dk), verify("correct horse", salt, dk), verify("wrong", salt, dk))   # 32 True False`,
javascript:`const crypto = require("crypto");

function hashPassword(password, iterations = 600000) {
  const salt = crypto.randomBytes(16);                   // unique random salt
  const dk = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return { salt, dk };
}

function verify(password, salt, dk, iterations = 600000) {
  const attempt = crypto.pbkdf2Sync(password, salt, iterations, 32, "sha256");
  return crypto.timingSafeEqual(attempt, dk);
}

const { salt, dk } = hashPassword("correct horse");
console.log(dk.length, verify("correct horse", salt, dk), verify("wrong", salt, dk));   // 32 true false`,
java:`import java.security.MessageDigest;
import java.security.SecureRandom;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

public class Pbkdf2Demo {
    static byte[] pbkdf2(String password, byte[] salt, int iterations) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password.toCharArray(), salt, iterations, 256);
        return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
    }

    public static void main(String[] args) throws Exception {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);                  // unique random salt
        byte[] dk = pbkdf2("correct horse", salt, 600_000);
        boolean ok = MessageDigest.isEqual(dk, pbkdf2("correct horse", salt, 600_000));
        boolean bad = MessageDigest.isEqual(dk, pbkdf2("wrong", salt, 600_000));
        System.out.println(dk.length + " " + ok + " " + bad);   // 32 true false
    }
}`,
cpp:`// Compile with: g++ pbkdf2.cpp -lcrypto
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <openssl/crypto.h>
#include <iostream>
#include <string>

bool pbkdf2(const std::string& pw, const unsigned char* salt, int iters, unsigned char out[32]) {
    return PKCS5_PBKDF2_HMAC(pw.data(), pw.size(), salt, 16, iters, EVP_sha256(), 32, out) == 1;
}

int main() {
    unsigned char salt[16], dk[32], attempt[32];
    RAND_bytes(salt, sizeof salt);                         // unique random salt
    pbkdf2("correct horse", salt, 600000, dk);
    pbkdf2("correct horse", salt, 600000, attempt);
    bool ok = CRYPTO_memcmp(dk, attempt, 32) == 0;
    pbkdf2("wrong", salt, 600000, attempt);
    bool bad = CRYPTO_memcmp(dk, attempt, 32) == 0;
    std::cout << 32 << ' ' << std::boolalpha << ok << ' ' << bad << '\\n';   // 32 true false
}`}},

scrypt:{name:'scrypt',cat:'kdf',
 blurb:'A memory-hard password hash: each guess needs a large block of RAM, which makes custom cracking hardware far more expensive than with PBKDF2.',
 cx:[['Parameters','N (cost), r (block size), p (parallelism)','Memory ≈ 128 · N · r bytes'],['Typical','N = 2¹⁷, r = 8, p = 1','≈ 128 MiB per hash'],['Time','O(N · r)',''],['Status','Good','Argon2id is the newer recommendation']],
 pts:['Fills a big array with pseudo-random data, then reads it back in a data-dependent order, so it can’t trade memory for time cheaply.','Created by Colin Percival in 2009 for the Tarsnap backup service; also used by Litecoin’s proof of work.','Raising N doubles both time and memory.','Available in Python hashlib, Node crypto and OpenSSL; Java needs BouncyCastle.'],
 pseudo:['procedure scrypt(password, salt, N, r, p, dkLen)','  B ← PBKDF2-SHA256(password, salt, 1, p · 128 · r)','  for each of the p chunks of B','    X ← chunk','    for i ← 0 to N − 1: V[i] ← X; X ← BlockMix(X)   // fill memory','    for i ← 0 to N − 1: j ← X mod N; X ← BlockMix(X XOR V[j])   // random reads','    chunk ← X','  return PBKDF2-SHA256(password, B, 1, dkLen)'],
 trace:[[1,'RFC 7914 test: password “password”, salt “NaCl”, N = 1024, r = 8, p = 16.'],[4,'Each chunk writes N = 1024 blocks of 1 KiB to memory.'],[5,'It then reads them back in an order that depends on the data itself.'],[7,'Output begins fdbabe1c9d3472007856e7190d01e9fe…, matching the RFC.'],[0,'An attacker’s chip must hold that memory for every parallel guess.']],
 q:{q:'What makes scrypt more resistant to GPU and ASIC cracking than PBKDF2?',o:['It uses SHA-512','It requires lots of memory per guess','It has a longer salt','It is newer'],a:1,why:'Memory is expensive to replicate across thousands of parallel cores, so each guess costs far more on custom hardware.'},
 code:{
python:`import hashlib

dk = hashlib.scrypt(b"password", salt=b"NaCl", n=1024, r=8, p=16, dklen=64)
print(dk.hex()[:32])   # fdbabe1c9d3472007856e7190d01e9fe  (RFC 7914 test vector)
# For real passwords: random 16-byte salt, n=2**17, r=8, p=1 (needs ~128 MiB).`,
javascript:`const crypto = require("crypto");

const dk = crypto.scryptSync("password", "NaCl", 64, { N: 1024, r: 8, p: 16 });
console.log(dk.toString("hex").slice(0, 32));   // fdbabe1c9d3472007856e7190d01e9fe
// Larger N needs a bigger maxmem option, e.g. { N: 2 ** 17, r: 8, p: 1, maxmem: 256 * 1024 * 1024 }.`,
java:`// Needs BouncyCastle (bcprov) on the classpath.
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import org.bouncycastle.crypto.generators.SCrypt;

public class ScryptDemo {
    public static void main(String[] args) {
        byte[] dk = SCrypt.generate("password".getBytes(StandardCharsets.UTF_8),
                                    "NaCl".getBytes(StandardCharsets.UTF_8), 1024, 8, 16, 64);
        System.out.println(HexFormat.of().formatHex(dk).substring(0, 32));   // fdbabe1c9d3472007856e7190d01e9fe
    }
}`,
cpp:`// Compile with: g++ scrypt.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    std::string pw = "password", salt = "NaCl";
    unsigned char dk[64];
    EVP_PBE_scrypt(pw.data(), pw.size(), (const unsigned char*)salt.data(), salt.size(),
                   1024, 8, 16, 0, dk, sizeof dk);          // 0 = default memory limit
    std::cout << hex(dk, sizeof dk).substr(0, 32) << '\\n';  // fdbabe1c9d3472007856e7190d01e9fe
}`}},

argon2:{name:'Argon2id',cat:'kdf',
 blurb:'Winner of the 2015 Password Hashing Competition and today’s recommended password hash. Tunable in time, memory and parallelism, and resistant to both GPU and side-channel attacks.',
 cx:[['Parameters','t (passes), m (memory KiB), p (lanes)','OWASP minimum: m = 19 MiB, t = 2, p = 1'],['Memory-hard','Yes','m KiB per hash'],['Variant','Argon2id','Hybrid of Argon2i (side-channel safe) and Argon2d (GPU resistant)'],['Status','Recommended (RFC 9106)','']],
 pts:['Fills m KiB of memory with blocks computed from BLAKE2b, making t passes over it.','The first pass uses data-independent addressing (resists timing side channels); later passes depend on the data (resist trade-off attacks).','Libraries produce an encoded string such as $argon2id$v=19$m=19456,t=2,p=1$<salt>$<hash> that stores all parameters.','bcrypt (1999, 72-byte password limit) is still acceptable for existing systems, but choose Argon2id for new ones.'],
 pseudo:['procedure Argon2id(password, salt, t, m, p, tagLen)','  H0 ← BLAKE2b(p, tagLen, m, t, version, type, password, salt, …)','  allocate m KiB as a matrix of p lanes × (m / p) blocks','  fill the first two blocks of each lane from H0','  for pass ← 1 to t','    for each block B[i][j]: B[i][j] ← G(B[i][j−1], B[ref])   // ref chosen per variant','  tag ← BLAKE2b-variable(XOR of the last block of every lane)','  return tag'],
 trace:[[1,'Inputs: password, 16-byte salt, t = 2, m = 19,456 KiB, p = 1.'],[2,'19 MiB is allocated: 19,456 blocks of 1 KiB.'],[5,'Pass 1 fills every block from earlier ones; pass 2 overwrites them again.'],[6,'The final block is compressed into a 32-byte tag.'],[0,'Verification parses the stored parameters, recomputes, and compares in constant time.']],
 q:{q:'For a new web application in 2026, which password hash should you choose?',o:['SHA-256 with a salt','MD5 with 1,000 iterations','Argon2id','Base64'],a:2,why:'Argon2id is memory-hard, tunable, standardized (RFC 9106) and recommended by OWASP.'},
 code:{
python:`# pip install argon2-cffi
from argon2 import PasswordHasher
from argon2.low_level import Type, hash_secret_raw

ph = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)   # OWASP baseline
stored = ph.hash("correct horse")         # random salt, all parameters encoded
print(stored.startswith("$argon2id$"))    # True
print(ph.verify(stored, "correct horse")) # True (raises VerifyMismatchError if wrong)

raw = hash_secret_raw(b"correct horse", b"fixedsalt1234567", time_cost=2,
                      memory_cost=19456, parallelism=1, hash_len=32, type=Type.ID)
print(raw.hex()[:16])                     # 7b835aef646e4e1b (fixed salt: demo only)`,
javascript:`// npm install argon2
const argon2 = require("argon2");

(async () => {
  const opts = { type: argon2.argon2id, timeCost: 2, memoryCost: 19456, parallelism: 1 };
  const stored = await argon2.hash("correct horse", opts);       // random salt, encoded string
  console.log(stored.startsWith("$argon2id$"));                   // true
  console.log(await argon2.verify(stored, "correct horse"));      // true

  const raw = await argon2.hash("correct horse", { ...opts, raw: true, hashLength: 32,
                                                   salt: Buffer.from("fixedsalt1234567") });
  console.log(raw.toString("hex").slice(0, 16));                 // 7b835aef646e4e1b
})();`,
java:`// Needs BouncyCastle (bcprov) on the classpath.
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;

public class Argon2Demo {
    public static void main(String[] args) {
        Argon2Parameters params = new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id)
                .withVersion(Argon2Parameters.ARGON2_VERSION_13)
                .withIterations(2).withMemoryAsKB(19456).withParallelism(1)
                .withSalt("fixedsalt1234567".getBytes(StandardCharsets.UTF_8))   // use a random salt in practice
                .build();
        Argon2BytesGenerator gen = new Argon2BytesGenerator();
        gen.init(params);
        byte[] out = new byte[32];
        gen.generateBytes("correct horse".getBytes(StandardCharsets.UTF_8), out);
        System.out.println(HexFormat.of().formatHex(out).substring(0, 16));   // 7b835aef646e4e1b
    }
}`,
cpp:`// Uses the reference library. Compile with: g++ argon2.cpp -largon2
#include <argon2.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    std::string pw = "correct horse", salt = "fixedsalt1234567";   // use a random salt in practice
    unsigned char raw[32];
    argon2id_hash_raw(2, 19456, 1, pw.data(), pw.size(), salt.data(), salt.size(), raw, sizeof raw);
    std::cout << hex(raw, sizeof raw).substr(0, 16) << '\\n';   // 7b835aef646e4e1b

    char encoded[128];
    argon2id_hash_encoded(2, 19456, 1, pw.data(), pw.size(), salt.data(), salt.size(), 32, encoded, sizeof encoded);
    std::cout << std::boolalpha << (argon2id_verify(encoded, pw.data(), pw.size()) == ARGON2_OK) << '\\n';   // true
}`}},

hkdf:{name:'HKDF',cat:'kdf',
 blurb:'HMAC-based Key Derivation Function: turns one strong secret (like a Diffie–Hellman result) into several independent keys. Not for passwords, which need a slow hash.',
 cx:[['Time','O(output length)','One HMAC per 32 output bytes'],['Input','High-entropy secret','Shared secrets, master keys'],['Output','Up to 255 × hash length',''],['Used in','TLS 1.3, Signal, WireGuard, HPKE','']],
 pts:['Extract: PRK = HMAC(salt, input key material) concentrates the entropy into a uniform key.','Expand: T(i) = HMAC(PRK, T(i−1) ‖ info ‖ i) stretches it to any length.','Different “info” strings (“client key”, “server key”) give independent keys from the same secret.','HKDF is fast on purpose, so never use it for passwords: use Argon2id or PBKDF2 there.'],
 pseudo:['procedure HKDF(ikm, salt, info, L)','  PRK ← HMAC(salt, ikm)   // extract','  T ← empty; out ← empty','  for i ← 1 while |out| < L   // expand','    T ← HMAC(PRK, T ‖ info ‖ byte(i))','    out ← out ‖ T','  return first L bytes of out'],
 trace:[[0,'RFC 5869 test 1: IKM = 22 bytes of 0x0b, salt = 00 01 … 0c, info = f0 … f9, L = 42.'],[1,'Extract: PRK = HMAC-SHA256(salt, IKM) = 077709362c2e32df…'],[4,'Expand: T(1) = HMAC(PRK, info ‖ 01), T(2) = HMAC(PRK, T(1) ‖ info ‖ 02).'],[6,'The first 42 bytes: 3cb25f25faacd57a90434f64d0362f2a…'],[0,'TLS 1.3 derives every handshake and traffic key this way.']],
 q:{q:'Why shouldn’t you use HKDF to hash user passwords?',o:['It produces short output','It is fast by design, so attackers can test guesses quickly','It needs a salt','It is deprecated'],a:1,why:'HKDF assumes the input is already high-entropy. Low-entropy passwords need a deliberately slow, memory-hard function.'},
 code:{
python:`from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF

ikm = bytes([0x0b] * 22)
salt = bytes(range(0x00, 0x0d))
info = bytes(range(0xf0, 0xfa))
okm = HKDF(algorithm=hashes.SHA256(), length=42, salt=salt, info=info).derive(ikm)
print(okm.hex()[:32])   # 3cb25f25faacd57a90434f64d0362f2a  (RFC 5869 test 1)`,
javascript:`const crypto = require("crypto");

const ikm = Buffer.alloc(22, 0x0b);
const salt = Buffer.from([...Array(13).keys()]);                   // 00..0c
const info = Buffer.from([...Array(10).keys()].map(i => 0xf0 + i)); // f0..f9
const okm = Buffer.from(crypto.hkdfSync("sha256", ikm, salt, info, 42));
console.log(okm.toString("hex").slice(0, 32));   // 3cb25f25faacd57a90434f64d0362f2a`,
java:`import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.HexFormat;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

public class HkdfDemo {
    static byte[] hmac(byte[] key, byte[] data) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(key, "HmacSHA256"));
        return mac.doFinal(data);
    }

    static byte[] hkdf(byte[] ikm, byte[] salt, byte[] info, int length) throws Exception {
        byte[] prk = hmac(salt, ikm);                          // extract
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] t = new byte[0];
        for (int i = 1; out.size() < length; i++) {            // expand
            ByteArrayOutputStream block = new ByteArrayOutputStream();
            block.write(t); block.write(info); block.write(i);
            t = hmac(prk, block.toByteArray());
            out.write(t);
        }
        return Arrays.copyOf(out.toByteArray(), length);
    }

    public static void main(String[] args) throws Exception {
        byte[] ikm = new byte[22], salt = new byte[13], info = new byte[10];
        Arrays.fill(ikm, (byte) 0x0b);
        for (int i = 0; i < 13; i++) salt[i] = (byte) i;
        for (int i = 0; i < 10; i++) info[i] = (byte) (0xf0 + i);
        System.out.println(HexFormat.of().formatHex(hkdf(ikm, salt, info, 42)).substring(0, 32));
        // 3cb25f25faacd57a90434f64d0362f2a
    }
}`,
cpp:`// Compile with: g++ hkdf.cpp -lcrypto
#include <openssl/evp.h>
#include <openssl/kdf.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    unsigned char ikm[22], salt[13], info[10], okm[42];
    for (auto& b : ikm) b = 0x0b;
    for (int i = 0; i < 13; i++) salt[i] = i;
    for (int i = 0; i < 10; i++) info[i] = 0xf0 + i;
    EVP_PKEY_CTX* ctx = EVP_PKEY_CTX_new_id(EVP_PKEY_HKDF, nullptr);
    EVP_PKEY_derive_init(ctx);
    EVP_PKEY_CTX_set_hkdf_md(ctx, EVP_sha256());
    EVP_PKEY_CTX_set1_hkdf_salt(ctx, salt, sizeof salt);
    EVP_PKEY_CTX_set1_hkdf_key(ctx, ikm, sizeof ikm);
    EVP_PKEY_CTX_add1_hkdf_info(ctx, info, sizeof info);
    size_t len = sizeof okm;
    EVP_PKEY_derive(ctx, okm, &len);
    EVP_PKEY_CTX_free(ctx);
    std::cout << hex(okm, len).substr(0, 32) << '\\n';   // 3cb25f25faacd57a90434f64d0362f2a
}`}}
});
