/* ===== Crypto library part C: symmetric encryption, public-key, signatures, advanced ===== */
const PY_TAMPER_NOTE='';
Object.assign(ALGOS,{

aes:{name:'AES (block cipher)',cat:'symmetric',
 blurb:'The Advanced Encryption Standard encrypts one 16-byte block at a time with a 128-, 192- or 256-bit key. It protects nearly all encrypted traffic and storage today.',
 cx:[['Block size','128 bits',''],['Key sizes','128 / 192 / 256 bits','10 / 12 / 14 rounds'],['Speed','Several GB/s','With AES-NI CPU instructions'],['Status','Secure (FIPS 197)','No practical attacks; quantum computers only halve the effective key size']],
 pts:['Chosen in a public competition in 2001 (Rijndael, by Daemen and Rijmen) to replace DES, whose 56-bit key fell to brute force in 1998.','Each round: SubBytes (S-box substitution), ShiftRows, MixColumns (diffusion), AddRoundKey.','A block cipher alone encrypts only 16 bytes; a mode of operation (CBC, CTR, GCM) is needed for real messages.','Never use ECB mode for more than one block: identical plaintext blocks produce identical ciphertext blocks (the famous “ECB penguin”).'],
 pseudo:['procedure AES-128-Encrypt(block, key)','  roundKeys ← KeyExpansion(key)   // 11 round keys','  state ← block XOR roundKeys[0]','  for round ← 1 to 9','    SubBytes; ShiftRows; MixColumns','    state ← state XOR roundKeys[round]','  SubBytes; ShiftRows   // final round skips MixColumns','  return state XOR roundKeys[10]'],
 trace:[[0,'FIPS-197 test: key 000102…0e0f, plaintext 00112233…eeff.'],[2,'The 16 bytes form a 4 × 4 grid, XORed with the first round key.'],[4,'SubBytes swaps each byte through the S-box; ShiftRows rotates rows; MixColumns blends each column.'],[7,'After 10 rounds: 69c4e0d86a7b0430d8cdb78070b4c55a, exactly as the standard specifies.'],[0,'Changing one key bit or one plaintext bit changes about half the output bits.']],
 q:{q:'Why is ECB mode dangerous for images or long messages?',o:['It is slow','Identical plaintext blocks give identical ciphertext blocks, leaking patterns','It needs a nonce','It only supports 128-bit keys'],a:1,why:'Each block is encrypted independently with the same key, so repetition in the input shows through.'},
 code:{
python:`from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

key = bytes.fromhex("000102030405060708090a0b0c0d0e0f")
block = bytes.fromhex("00112233445566778899aabbccddeeff")

# One raw block (FIPS-197 test vector). ECB is used ONLY to expose the block cipher;
# never use ECB for real data.
enc = Cipher(algorithms.AES(key), modes.ECB()).encryptor()
ct = enc.update(block) + enc.finalize()
print(ct.hex())   # 69c4e0d86a7b0430d8cdb78070b4c55a`,
javascript:`const crypto = require("crypto");

const key = Buffer.from("000102030405060708090a0b0c0d0e0f", "hex");
const block = Buffer.from("00112233445566778899aabbccddeeff", "hex");

// One raw block (FIPS-197 test vector). Never use ECB for real data.
const cipher = crypto.createCipheriv("aes-128-ecb", key, null).setAutoPadding(false);
const ct = Buffer.concat([cipher.update(block), cipher.final()]);
console.log(ct.toString("hex"));   // 69c4e0d86a7b0430d8cdb78070b4c55a`,
java:`import java.util.HexFormat;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

public class AesBlock {
    public static void main(String[] args) throws Exception {
        HexFormat hex = HexFormat.of();
        byte[] key = hex.parseHex("000102030405060708090a0b0c0d0e0f");
        byte[] block = hex.parseHex("00112233445566778899aabbccddeeff");
        // One raw block (FIPS-197 test vector). Never use ECB for real data.
        Cipher c = Cipher.getInstance("AES/ECB/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"));
        System.out.println(hex.formatHex(c.doFinal(block)));   // 69c4e0d86a7b0430d8cdb78070b4c55a
    }
}`,
cpp:`// Compile with: g++ aes.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    unsigned char key[16], block[16], out[32];
    for (int i = 0; i < 16; i++) { key[i] = i; block[i] = i * 0x11; }   // FIPS-197 test vector
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    EVP_EncryptInit_ex(ctx, EVP_aes_128_ecb(), nullptr, key, nullptr);   // never ECB for real data
    EVP_CIPHER_CTX_set_padding(ctx, 0);
    int len = 0, fin = 0;
    EVP_EncryptUpdate(ctx, out, &len, block, 16);
    EVP_EncryptFinal_ex(ctx, out + len, &fin);
    EVP_CIPHER_CTX_free(ctx);
    std::cout << hex(out, len + fin) << '\\n';   // 69c4e0d86a7b0430d8cdb78070b4c55a
}`}},

cbc:{name:'CBC mode',cat:'symmetric',
 blurb:'Cipher Block Chaining XORs each plaintext block with the previous ciphertext block before encrypting, so repeated blocks no longer look the same. Needs a random IV and padding.',
 cx:[['Encrypt','Sequential','Each block depends on the previous one'],['Decrypt','Parallel','All ciphertext blocks are known'],['IV','16 random bytes','Unpredictable, sent with the ciphertext'],['Status','Legacy','No integrity; padding-oracle attacks. Prefer GCM or ChaCha20-Poly1305']],
 pts:['C₀ = E(K, P₀ ⊕ IV), Cᵢ = E(K, Pᵢ ⊕ Cᵢ₋₁).','PKCS#7 padding fills the last block with N bytes of value N (a full extra block if already aligned).','A predictable IV broke TLS 1.0 (the BEAST attack, 2011).','Without a MAC, attackers can flip bits and abuse padding error messages to decrypt data (padding oracle). Always encrypt-then-MAC, or just use an AEAD mode.'],
 pseudo:['procedure CBC-Encrypt(K, P)','  IV ← 16 random bytes','  pad P with PKCS#7 to a multiple of 16 bytes','  prev ← IV','  for each block Pᵢ','    Cᵢ ← AES(K, Pᵢ XOR prev); prev ← Cᵢ','  return IV ‖ C','CBC-Decrypt: Pᵢ ← AES⁻¹(K, Cᵢ) XOR Cᵢ₋₁, then strip the padding'],
 trace:[[1,'Pick a fresh random 16-byte IV for every message.'],[2,'“Attack at dawn, bring snacks.” is 29 bytes, so 3 bytes of 0x03 make 32.'],[5,'Block 1 is XORed with the IV, block 2 with ciphertext block 1.'],[6,'Output: IV (16 bytes) + 32 bytes of ciphertext.'],[7,'Decryption reverses the chain and removes the 03 03 03 padding.']],
 q:{q:'What does CBC mode NOT protect against?',o:['Repeated plaintext blocks showing through','Someone reading the message','An attacker modifying the ciphertext','Long messages'],a:2,why:'CBC provides confidentiality only. Use an authenticated mode (GCM, ChaCha20-Poly1305) or add a MAC.'},
 code:{
python:`import os
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

key, iv = os.urandom(32), os.urandom(16)          # fresh random IV per message
plain = b"Attack at dawn, bring snacks."

padder = padding.PKCS7(128).padder()
padded = padder.update(plain) + padder.finalize()
enc = Cipher(algorithms.AES(key), modes.CBC(iv)).encryptor()
ct = enc.update(padded) + enc.finalize()

dec = Cipher(algorithms.AES(key), modes.CBC(iv)).decryptor()
unpadder = padding.PKCS7(128).unpadder()
out = unpadder.update(dec.update(ct) + dec.finalize()) + unpadder.finalize()
print(len(ct), out.decode())   # 32 Attack at dawn, bring snacks.
# CBC has no integrity check: in new code use AES-GCM instead.`,
javascript:`const crypto = require("crypto");

const key = crypto.randomBytes(32), iv = crypto.randomBytes(16);   // fresh IV per message
const plain = "Attack at dawn, bring snacks.";

const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);        // PKCS#7 padding by default
const ct = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);

const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
const out = Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
console.log(ct.length, out);   // 32 Attack at dawn, bring snacks.`,
java:`import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class CbcDemo {
    public static void main(String[] args) throws Exception {
        SecureRandom rng = new SecureRandom();
        byte[] key = new byte[32], iv = new byte[16];
        rng.nextBytes(key); rng.nextBytes(iv);                 // fresh IV per message
        SecretKeySpec k = new SecretKeySpec(key, "AES");

        Cipher enc = Cipher.getInstance("AES/CBC/PKCS5Padding");   // PKCS5 = PKCS#7 for AES
        enc.init(Cipher.ENCRYPT_MODE, k, new IvParameterSpec(iv));
        byte[] ct = enc.doFinal("Attack at dawn, bring snacks.".getBytes(StandardCharsets.UTF_8));

        Cipher dec = Cipher.getInstance("AES/CBC/PKCS5Padding");
        dec.init(Cipher.DECRYPT_MODE, k, new IvParameterSpec(iv));
        System.out.println(ct.length + " " + new String(dec.doFinal(ct), StandardCharsets.UTF_8));
        // 32 Attack at dawn, bring snacks.
    }
}`,
cpp:`// Compile with: g++ cbc.cpp -lcrypto
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <iostream>
#include <string>
#include <vector>

std::vector<unsigned char> run(bool encrypt, const unsigned char* key, const unsigned char* iv,
                               const unsigned char* in, int inLen) {
    std::vector<unsigned char> out(inLen + 16);
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    EVP_CipherInit_ex(ctx, EVP_aes_256_cbc(), nullptr, key, iv, encrypt ? 1 : 0);   // PKCS#7 padding on
    int len = 0, fin = 0;
    EVP_CipherUpdate(ctx, out.data(), &len, in, inLen);
    EVP_CipherFinal_ex(ctx, out.data() + len, &fin);
    EVP_CIPHER_CTX_free(ctx);
    out.resize(len + fin);
    return out;
}

int main() {
    unsigned char key[32], iv[16];
    RAND_bytes(key, sizeof key); RAND_bytes(iv, sizeof iv);   // fresh IV per message
    std::string plain = "Attack at dawn, bring snacks.";
    auto ct = run(true, key, iv, (const unsigned char*)plain.data(), plain.size());
    auto pt = run(false, key, iv, ct.data(), ct.size());
    std::cout << ct.size() << ' ' << std::string(pt.begin(), pt.end()) << '\\n';
    // 32 Attack at dawn, bring snacks.
}`}},

ctr:{name:'CTR mode',cat:'symmetric',
 blurb:'Counter mode turns a block cipher into a stream cipher: encrypt a counter (nonce + block number) to get a keystream, then XOR it with the message. No padding needed, fully parallel.',
 cx:[['Encrypt / decrypt','Parallel','Any block can be computed independently'],['Padding','None','Ciphertext length = plaintext length'],['Nonce','Unique per key','Never reuse a (key, counter) pair'],['Status','Building block','No integrity on its own; GCM = CTR + GHASH']],
 pts:['Keystream block i = AES(K, nonce ‖ i); ciphertext = plaintext ⊕ keystream.','Encryption and decryption are the same operation.','Reusing a nonce with the same key reuses the keystream: exactly the two-time-pad attack from the XOR lesson.','Random access: you can decrypt block 1,000,000 without touching the earlier ones (useful for disk encryption and video).'],
 pseudo:['procedure CTR(K, counter0, data)','  for each 16-byte block i of data','    keystream ← AES(K, counter0 + i)','    out_i ← data_i XOR keystream   // last block may be partial','  return out   // decrypt = the same procedure'],
 trace:[[0,'NIST SP 800-38A F.5.1: key 2b7e1516…4f3c, initial counter f0f1f2…feff.'],[2,'AES encrypts the counter value to produce 16 keystream bytes.'],[3,'Plaintext block 6bc1bee22e409f96e93d7e117393172a XOR keystream = 874d6191b620e3261bef6864990db6ce.'],[2,'The next block uses counter + 1, so each keystream block is different.'],[4,'Running CTR again on the ciphertext with the same counter returns the plaintext.']],
 q:{q:'In CTR mode, what happens if two messages are encrypted with the same key and the same nonce?',o:['Nothing, CTR is safe','The XOR of the two ciphertexts equals the XOR of the two plaintexts','Decryption fails','The key is revealed directly'],a:1,why:'Both messages are XORed with the identical keystream, which cancels out exactly like a reused one-time pad.'},
 code:{
python:`from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

key = bytes.fromhex("2b7e151628aed2a6abf7158809cf4f3c")
counter = bytes.fromhex("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff")   # fixed only for the test vector
plain = bytes.fromhex("6bc1bee22e409f96e93d7e117393172a")

enc = Cipher(algorithms.AES(key), modes.CTR(counter)).encryptor()
ct = enc.update(plain) + enc.finalize()
print(ct.hex())   # 874d6191b620e3261bef6864990db6ce  (NIST SP 800-38A)

dec = Cipher(algorithms.AES(key), modes.CTR(counter)).decryptor()
print(dec.update(ct) == plain)   # True`,
javascript:`const crypto = require("crypto");

const key = Buffer.from("2b7e151628aed2a6abf7158809cf4f3c", "hex");
const counter = Buffer.from("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff", "hex");   // fixed only for the test vector
const plain = Buffer.from("6bc1bee22e409f96e93d7e117393172a", "hex");

const ct = crypto.createCipheriv("aes-128-ctr", key, counter).update(plain);
console.log(ct.toString("hex"));   // 874d6191b620e3261bef6864990db6ce
const back = crypto.createDecipheriv("aes-128-ctr", key, counter).update(ct);
console.log(back.equals(plain));   // true`,
java:`import java.util.Arrays;
import java.util.HexFormat;
import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

public class CtrDemo {
    public static void main(String[] args) throws Exception {
        HexFormat hex = HexFormat.of();
        SecretKeySpec key = new SecretKeySpec(hex.parseHex("2b7e151628aed2a6abf7158809cf4f3c"), "AES");
        IvParameterSpec counter = new IvParameterSpec(hex.parseHex("f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff"));
        byte[] plain = hex.parseHex("6bc1bee22e409f96e93d7e117393172a");

        Cipher c = Cipher.getInstance("AES/CTR/NoPadding");
        c.init(Cipher.ENCRYPT_MODE, key, counter);
        byte[] ct = c.doFinal(plain);
        System.out.println(hex.formatHex(ct));   // 874d6191b620e3261bef6864990db6ce
        c.init(Cipher.DECRYPT_MODE, key, counter);
        System.out.println(Arrays.equals(c.doFinal(ct), plain));   // true
    }
}`,
cpp:`// Compile with: g++ ctr.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>
#include <cstring>

${CPP_HEX}

void ctr(const unsigned char* key, const unsigned char* counter, const unsigned char* in, int n, unsigned char* out) {
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    EVP_EncryptInit_ex(ctx, EVP_aes_128_ctr(), nullptr, key, counter);
    int len = 0;
    EVP_EncryptUpdate(ctx, out, &len, in, n);   // CTR: encrypt and decrypt are identical
    EVP_CIPHER_CTX_free(ctx);
}

int main() {
    const unsigned char key[16] = {0x2b,0x7e,0x15,0x16,0x28,0xae,0xd2,0xa6,0xab,0xf7,0x15,0x88,0x09,0xcf,0x4f,0x3c};
    unsigned char counter[16], plain[16] = {0x6b,0xc1,0xbe,0xe2,0x2e,0x40,0x9f,0x96,0xe9,0x3d,0x7e,0x11,0x73,0x93,0x17,0x2a};
    for (int i = 0; i < 16; i++) counter[i] = 0xf0 + i;
    unsigned char ct[16], back[16];
    ctr(key, counter, plain, 16, ct);
    std::cout << hex(ct, 16) << '\\n';                                  // 874d6191b620e3261bef6864990db6ce
    ctr(key, counter, ct, 16, back);
    std::cout << std::boolalpha << (std::memcmp(back, plain, 16) == 0) << '\\n';   // true
}`}},

gcm:{name:'AES-GCM (authenticated encryption)',cat:'symmetric',
 blurb:'Galois/Counter Mode encrypts with CTR and computes an authentication tag over the ciphertext and any extra associated data. Tampering is detected before you ever see the plaintext.',
 cx:[['Speed','Very fast','AES-NI + carry-less multiply instructions'],['Nonce','12 bytes, unique per key','Random nonces: rotate keys before ~2³² messages'],['Tag','16 bytes',''],['Status','Recommended','The default cipher suite in TLS 1.3']],
 pts:['AEAD = Authenticated Encryption with Associated Data: one call gives confidentiality and integrity.','Associated data (headers, user IDs) is authenticated but not encrypted.','Decryption must fail completely if the tag doesn’t verify; never use partially decrypted data.','Nonce reuse is catastrophic for GCM: it leaks the XOR of plaintexts and lets attackers forge tags.'],
 pseudo:['procedure GCM-Encrypt(K, nonce, P, AAD)','  H ← AES(K, 0¹²⁸)                 // hash subkey','  C ← CTR(K, nonce ‖ 2, P)        // counter starts at 2','  S ← GHASH_H(AAD, C, lengths)    // polynomial multiply in GF(2¹²⁸)','  tag ← S XOR AES(K, nonce ‖ 1)','  return C, tag','Decrypt: recompute the tag; if it differs → reject, output nothing'],
 trace:[[0,'Key: 256 random bits. Nonce: 12 random bytes. AAD: “user:42”.'],[2,'The message is encrypted with AES in counter mode.'],[3,'GHASH folds the AAD and ciphertext into one 128-bit value.'],[4,'The 16-byte tag travels with the ciphertext.'],[6,'Flip one bit of the ciphertext and decryption raises an authentication error.']],
 q:{q:'An AES-GCM decryption fails with an authentication error. What should the application do?',o:['Use the plaintext anyway','Retry with a different nonce','Reject the message entirely','Strip the last 16 bytes and try again'],a:2,why:'A tag failure means the data was modified or the key/nonce is wrong. Nothing from it can be trusted.'},
 code:{
python:`import os
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

key = AESGCM.generate_key(bit_length=256)
aes = AESGCM(key)
nonce = os.urandom(12)                     # never reuse with the same key
aad = b"user:42"                           # authenticated, not encrypted

ct = aes.encrypt(nonce, b"transfer $100 to Bob", aad)   # ciphertext + 16-byte tag
print(aes.decrypt(nonce, ct, aad).decode())             # transfer $100 to Bob

tampered = bytearray(ct)
tampered[0] ^= 1
try:
    aes.decrypt(nonce, bytes(tampered), aad)
except InvalidTag:
    print("tampered: rejected")`,
javascript:`const crypto = require("crypto");

const key = crypto.randomBytes(32), nonce = crypto.randomBytes(12), aad = Buffer.from("user:42");

const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);
cipher.setAAD(aad);
const ct = Buffer.concat([cipher.update("transfer $100 to Bob", "utf8"), cipher.final()]);
const tag = cipher.getAuthTag();

function decrypt(data) {
  const d = crypto.createDecipheriv("aes-256-gcm", key, nonce);
  d.setAAD(aad);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString("utf8");   // final() throws on bad tag
}

console.log(decrypt(ct));                  // transfer $100 to Bob
const tampered = Buffer.from(ct);
tampered[0] ^= 1;
try { decrypt(tampered); } catch { console.log("tampered: rejected"); }`,
java:`import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

public class GcmDemo {
    public static void main(String[] args) throws Exception {
        KeyGenerator kg = KeyGenerator.getInstance("AES");
        kg.init(256);
        SecretKey key = kg.generateKey();
        byte[] nonce = new byte[12];
        new SecureRandom().nextBytes(nonce);                     // never reuse with the same key
        byte[] aad = "user:42".getBytes(StandardCharsets.UTF_8);

        Cipher enc = Cipher.getInstance("AES/GCM/NoPadding");
        enc.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(128, nonce));
        enc.updateAAD(aad);
        byte[] ct = enc.doFinal("transfer $100 to Bob".getBytes(StandardCharsets.UTF_8));   // includes tag

        Cipher dec = Cipher.getInstance("AES/GCM/NoPadding");
        dec.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, nonce));
        dec.updateAAD(aad);
        System.out.println(new String(dec.doFinal(ct), StandardCharsets.UTF_8));   // transfer $100 to Bob

        ct[0] ^= 1;
        try {
            dec.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(128, nonce));
            dec.updateAAD(aad);
            dec.doFinal(ct);
        } catch (AEADBadTagException e) {
            System.out.println("tampered: rejected");
        }
    }
}`,
cpp:`// Compile with: g++ gcm.cpp -lcrypto
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <iostream>
#include <string>
#include <vector>

using Bytes = std::vector<unsigned char>;

Bytes encrypt(const Bytes& key, const Bytes& nonce, const std::string& aad, const std::string& pt, Bytes& tag) {
    Bytes ct(pt.size());
    int len = 0;
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    EVP_EncryptInit_ex(ctx, EVP_aes_256_gcm(), nullptr, key.data(), nonce.data());   // 12-byte nonce default
    EVP_EncryptUpdate(ctx, nullptr, &len, (const unsigned char*)aad.data(), aad.size());
    EVP_EncryptUpdate(ctx, ct.data(), &len, (const unsigned char*)pt.data(), pt.size());
    EVP_EncryptFinal_ex(ctx, ct.data() + len, &len);
    tag.resize(16);
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_GET_TAG, 16, tag.data());
    EVP_CIPHER_CTX_free(ctx);
    return ct;
}

bool decrypt(const Bytes& key, const Bytes& nonce, const std::string& aad, const Bytes& ct, Bytes tag, std::string& out) {
    Bytes pt(ct.size());
    int len = 0;
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    EVP_DecryptInit_ex(ctx, EVP_aes_256_gcm(), nullptr, key.data(), nonce.data());
    EVP_DecryptUpdate(ctx, nullptr, &len, (const unsigned char*)aad.data(), aad.size());
    EVP_DecryptUpdate(ctx, pt.data(), &len, ct.data(), ct.size());
    EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_GCM_SET_TAG, 16, tag.data());
    bool ok = EVP_DecryptFinal_ex(ctx, pt.data() + len, &len) > 0;   // fails on a bad tag
    EVP_CIPHER_CTX_free(ctx);
    if (ok) out.assign(pt.begin(), pt.end());
    return ok;
}

int main() {
    Bytes key(32), nonce(12), tag;
    RAND_bytes(key.data(), 32); RAND_bytes(nonce.data(), 12);   // never reuse a nonce with a key
    Bytes ct = encrypt(key, nonce, "user:42", "transfer $100 to Bob", tag);
    std::string out;
    if (decrypt(key, nonce, "user:42", ct, tag, out)) std::cout << out << '\\n';   // transfer $100 to Bob
    ct[0] ^= 1;
    if (!decrypt(key, nonce, "user:42", ct, tag, out)) std::cout << "tampered: rejected\\n";
}`}},

chacha20:{name:'ChaCha20-Poly1305',cat:'symmetric',
 blurb:'An authenticated cipher built from the ChaCha20 stream cipher and the Poly1305 MAC. As strong as AES-GCM and faster on devices without AES hardware, such as many phones.',
 cx:[['Key','256 bits',''],['Nonce','12 bytes, unique per key','XChaCha20 uses 24 bytes, safe to pick at random'],['Speed','Fast everywhere','Only add, rotate, XOR (ARX)'],['Status','Recommended','TLS 1.3, WireGuard, SSH, Signal']],
 pts:['ChaCha20 (Daniel J. Bernstein, 2008) generates a keystream from 20 rounds of a quarter-round function on a 4 × 4 grid of 32-bit words.','Poly1305 is a one-time MAC evaluated as a polynomial modulo 2¹³⁰ − 5.','ARX operations run in constant time on any CPU, avoiding cache-timing leaks that table-based AES can have.','Same API shape as AES-GCM: key, nonce, plaintext, associated data → ciphertext + 16-byte tag.'],
 pseudo:['procedure ChaCha20-Poly1305-Encrypt(K, nonce, P, AAD)','  polyKey ← first 32 bytes of ChaCha20(K, nonce, counter 0)','  C ← P XOR ChaCha20 keystream(K, nonce, counter 1, 2, …)','  tag ← Poly1305(polyKey, AAD ‖ pad ‖ C ‖ pad ‖ lengths)','  return C, tag','QuarterRound(a, b, c, d): a += b; d ^= a; d <<<= 16; c += d; b ^= c; b <<<= 12; …'],
 trace:[[0,'256-bit key, 12-byte nonce, AAD “user:42”.'],[1,'Block 0 of the keystream becomes a fresh one-time Poly1305 key.'],[2,'Blocks 1, 2, … are XORed with the message.'],[3,'Poly1305 authenticates the AAD and ciphertext.'],[4,'Any change to ciphertext, AAD or tag makes decryption fail.']],
 q:{q:'Why might a mobile app prefer ChaCha20-Poly1305 over AES-GCM?',o:['It has a longer tag','It is faster and constant-time on CPUs without AES hardware instructions','AES-GCM is broken','It needs no nonce'],a:1,why:'Without AES-NI, software AES is slower and risks timing leaks; ChaCha20’s add-rotate-XOR design is fast and safe everywhere.'},
 code:{
python:`import os
from cryptography.exceptions import InvalidTag
from cryptography.hazmat.primitives.ciphers.aead import ChaCha20Poly1305

key = ChaCha20Poly1305.generate_key()
box = ChaCha20Poly1305(key)
nonce = os.urandom(12)                    # never reuse with the same key
aad = b"user:42"

ct = box.encrypt(nonce, b"meet at the usual place", aad)
print(box.decrypt(nonce, ct, aad).decode())   # meet at the usual place
try:
    box.decrypt(nonce, ct, b"user:43")        # wrong associated data
except InvalidTag:
    print("tampered: rejected")`,
javascript:`const crypto = require("crypto");

const key = crypto.randomBytes(32), nonce = crypto.randomBytes(12);

const c = crypto.createCipheriv("chacha20-poly1305", key, nonce, { authTagLength: 16 });
c.setAAD(Buffer.from("user:42"), { plaintextLength: 23 });
const ct = Buffer.concat([c.update("meet at the usual place", "utf8"), c.final()]);
const tag = c.getAuthTag();

function decrypt(aad) {
  const d = crypto.createDecipheriv("chacha20-poly1305", key, nonce, { authTagLength: 16 });
  d.setAAD(Buffer.from(aad), { plaintextLength: ct.length });
  d.setAuthTag(tag);
  return Buffer.concat([d.update(ct), d.final()]).toString("utf8");
}

console.log(decrypt("user:42"));           // meet at the usual place
try { decrypt("user:43"); } catch { console.log("tampered: rejected"); }`,
java:`import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.AEADBadTagException;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;

public class ChaChaDemo {
    static byte[] run(int mode, SecretKey key, byte[] nonce, String aad, byte[] data) throws Exception {
        Cipher c = Cipher.getInstance("ChaCha20-Poly1305");
        c.init(mode, key, new IvParameterSpec(nonce));
        c.updateAAD(aad.getBytes(StandardCharsets.UTF_8));
        return c.doFinal(data);
    }

    public static void main(String[] args) throws Exception {
        SecretKey key = KeyGenerator.getInstance("ChaCha20").generateKey();
        byte[] nonce = new byte[12];
        new SecureRandom().nextBytes(nonce);                  // never reuse with the same key
        byte[] ct = run(Cipher.ENCRYPT_MODE, key, nonce, "user:42",
                        "meet at the usual place".getBytes(StandardCharsets.UTF_8));
        System.out.println(new String(run(Cipher.DECRYPT_MODE, key, nonce, "user:42", ct), StandardCharsets.UTF_8));
        try {
            run(Cipher.DECRYPT_MODE, key, nonce, "user:43", ct);   // wrong associated data
        } catch (AEADBadTagException e) {
            System.out.println("tampered: rejected");
        }
    }
}`,
cpp:`// Compile with: g++ chacha.cpp -lcrypto
#include <openssl/evp.h>
#include <openssl/rand.h>
#include <iostream>
#include <string>
#include <vector>

using Bytes = std::vector<unsigned char>;

bool aead(bool enc, const Bytes& key, const Bytes& nonce, const std::string& aad,
          const Bytes& in, Bytes& out, Bytes& tag) {
    out.assign(in.size(), 0);
    int len = 0;
    EVP_CIPHER_CTX* ctx = EVP_CIPHER_CTX_new();
    EVP_CipherInit_ex(ctx, EVP_chacha20_poly1305(), nullptr, key.data(), nonce.data(), enc);
    EVP_CipherUpdate(ctx, nullptr, &len, (const unsigned char*)aad.data(), aad.size());
    EVP_CipherUpdate(ctx, out.data(), &len, in.data(), in.size());
    if (!enc) EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_AEAD_SET_TAG, 16, tag.data());
    bool ok = EVP_CipherFinal_ex(ctx, out.data() + len, &len) > 0;
    if (enc) { tag.resize(16); EVP_CIPHER_CTX_ctrl(ctx, EVP_CTRL_AEAD_GET_TAG, 16, tag.data()); }
    EVP_CIPHER_CTX_free(ctx);
    return ok;
}

int main() {
    Bytes key(32), nonce(12), ct, pt, tag;
    RAND_bytes(key.data(), 32); RAND_bytes(nonce.data(), 12);
    std::string msg = "meet at the usual place";
    aead(true, key, nonce, "user:42", Bytes(msg.begin(), msg.end()), ct, tag);
    if (aead(false, key, nonce, "user:42", ct, pt, tag)) std::cout << std::string(pt.begin(), pt.end()) << '\\n';
    if (!aead(false, key, nonce, "user:43", ct, pt, tag)) std::cout << "tampered: rejected\\n";
}`}},

rsaoaep:{name:'RSA-OAEP (real-world RSA)',cat:'publickey',
 blurb:'Production RSA: 2048-bit or larger keys, with OAEP padding that randomizes every encryption. Mostly used to encrypt small things like symmetric keys, not bulk data.',
 cx:[['Key size','2048–4096 bits','3072 bits ≈ 128-bit security'],['Max message','k − 2·hLen − 2 bytes','190 bytes for RSA-2048 with SHA-256'],['Speed','Slow','~1,000× slower than AES; decryption ≈ O(k³)'],['Status','Secure but being phased out','Not quantum-safe; TLS 1.3 removed RSA key transport']],
 pts:['OAEP mixes random bytes into the message before raising it to the power e, so the same plaintext never gives the same ciphertext.','Textbook RSA (from the RSA lesson) is deterministic and malleable, so it must never be used directly.','Hybrid encryption: encrypt a random AES key with RSA, and the data with AES-GCM.','PKCS#1 v1.5 encryption padding is vulnerable to Bleichenbacher’s padding-oracle attack; use OAEP.'],
 pseudo:['procedure RSA-OAEP-Encrypt(publicKey(n, e), M)','  seed ← random hLen bytes','  DB ← H(label) ‖ zeros ‖ 0x01 ‖ M','  maskedDB ← DB XOR MGF1(seed)','  maskedSeed ← seed XOR MGF1(maskedDB)','  m ← integer(0x00 ‖ maskedSeed ‖ maskedDB)','  return mᵉ mod n'],
 trace:[[0,'Generate a 2048-bit key pair; e = 65537.'],[1,'A fresh random seed is chosen for this encryption.'],[4,'Two mask-generation steps scramble the message and seed together.'],[6,'The padded number is raised to e mod n: 256 bytes of ciphertext.'],[0,'Encrypting the same message again produces a completely different ciphertext.']],
 q:{q:'Why do real systems encrypt files with AES and use RSA only for the AES key?',o:['RSA can’t encrypt numbers','RSA is slow and can only encrypt a small message per operation','AES keys are public','RSA is broken'],a:1,why:'This is hybrid encryption: RSA (or ECDH) shares a short key, and a fast symmetric cipher handles the data.'},
 code:{
python:`from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa

private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
public_key = private_key.public_key()
oaep = padding.OAEP(mgf=padding.MGF1(hashes.SHA256()), algorithm=hashes.SHA256(), label=None)

ct = public_key.encrypt(b"a 32-byte AES key would go here", oaep)
print(len(ct))                                   # 256
print(private_key.decrypt(ct, oaep).decode())    # a 32-byte AES key would go here`,
javascript:`const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", { modulusLength: 2048 });
const opts = { padding: crypto.constants.RSA_PKCS1_OAEP_PADDING, oaepHash: "sha256" };

const ct = crypto.publicEncrypt({ key: publicKey, ...opts }, Buffer.from("a 32-byte AES key would go here"));
console.log(ct.length);                                                    // 256
console.log(crypto.privateDecrypt({ key: privateKey, ...opts }, ct).toString());`,
java:`import java.nio.charset.StandardCharsets;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.spec.MGF1ParameterSpec;
import javax.crypto.Cipher;
import javax.crypto.spec.OAEPParameterSpec;
import javax.crypto.spec.PSource;

public class RsaOaepDemo {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        KeyPair kp = kpg.generateKeyPair();
        // Spell out SHA-256 for both the hash and MGF1 so other languages interoperate.
        OAEPParameterSpec oaep = new OAEPParameterSpec("SHA-256", "MGF1", MGF1ParameterSpec.SHA256,
                                                       PSource.PSpecified.DEFAULT);
        Cipher c = Cipher.getInstance("RSA/ECB/OAEPPadding");
        c.init(Cipher.ENCRYPT_MODE, kp.getPublic(), oaep);
        byte[] ct = c.doFinal("a 32-byte AES key would go here".getBytes(StandardCharsets.UTF_8));
        System.out.println(ct.length);                                   // 256
        c.init(Cipher.DECRYPT_MODE, kp.getPrivate(), oaep);
        System.out.println(new String(c.doFinal(ct), StandardCharsets.UTF_8));
    }
}`,
cpp:`// Compile with: g++ rsa_oaep.cpp -lcrypto   (OpenSSL 3)
#include <openssl/evp.h>
#include <openssl/rsa.h>
#include <iostream>
#include <string>
#include <vector>

std::vector<unsigned char> crypt(EVP_PKEY* key, bool encrypt, const std::vector<unsigned char>& in) {
    EVP_PKEY_CTX* ctx = EVP_PKEY_CTX_new(key, nullptr);
    encrypt ? EVP_PKEY_encrypt_init(ctx) : EVP_PKEY_decrypt_init(ctx);
    EVP_PKEY_CTX_set_rsa_padding(ctx, RSA_PKCS1_OAEP_PADDING);
    EVP_PKEY_CTX_set_rsa_oaep_md(ctx, EVP_sha256());
    EVP_PKEY_CTX_set_rsa_mgf1_md(ctx, EVP_sha256());
    size_t len = 0;
    auto op = encrypt ? EVP_PKEY_encrypt : EVP_PKEY_decrypt;
    op(ctx, nullptr, &len, in.data(), in.size());           // query the output size
    std::vector<unsigned char> out(len);
    op(ctx, out.data(), &len, in.data(), in.size());
    out.resize(len);
    EVP_PKEY_CTX_free(ctx);
    return out;
}

int main() {
    EVP_PKEY* key = EVP_RSA_gen(2048);
    std::string msg = "a 32-byte AES key would go here";
    auto ct = crypt(key, true, {msg.begin(), msg.end()});
    auto pt = crypt(key, false, ct);
    std::cout << ct.size() << '\\n' << std::string(pt.begin(), pt.end()) << '\\n';
    EVP_PKEY_free(key);
}`}},

ecc:{name:'Elliptic curve arithmetic',cat:'publickey',
 blurb:'Points on a curve y² = x³ + ax + b over a finite field can be “added”. Repeated addition (k × G) is easy, but recovering k from k × G is hard: the elliptic curve discrete log problem.',
 cx:[['Point add / double','O(1) field operations','Each needs one modular inverse (or projective coordinates)'],['Scalar multiply k × G','O(log k)','Double-and-add, like square-and-multiply'],['Security per bit','Much higher than RSA','256-bit ECC ≈ 3072-bit RSA'],['Best attack','Pollard rho, O(√n)','2¹²⁸ steps for 256-bit curves']],
 pts:['Adding two points: draw the line through them, take its third intersection with the curve, and reflect it across the x-axis.','Doubling uses the tangent line. The point at infinity acts like zero.','A private key is a number k; the public key is the point k × G for a fixed base point G.','Real curves (P-256, Curve25519) use ~256-bit primes. The toy curve below uses p = 97 so you can follow the numbers.'],
 pseudo:['procedure add(P, Q)   // on y² = x³ + ax + b mod p','  if P = ∞: return Q;  if Q = ∞: return P','  if x_P = x_Q and y_P = −y_Q: return ∞','  λ ← (y_Q − y_P)/(x_Q − x_P), or (3x_P² + a)/(2y_P) when P = Q','  x ← λ² − x_P − x_Q;  y ← λ(x_P − x) − y_P','  return (x mod p, y mod p)','procedure multiply(k, P): double-and-add over the bits of k'],
 trace:[[0,'Toy curve y² = x³ + 2x + 3 mod 97, base point G = (3, 6): 6² = 36 and 27 + 6 + 3 = 36 ✓.'],[3,'2G: tangent slope λ = (3·9 + 2)/(2·6) = 29/12 mod 97.'],[4,'The formulas give 2G = (80, 10).'],[6,'Alice’s secret a = 7 → A = 7G; Bob’s secret b = 11 → B = 11G.'],[6,'Both compute the same shared point: a × B = b × A = 77G. That is ECDH.']],
 q:{q:'An elliptic-curve public key is the point k × G. What is hard for an attacker?',o:['Computing k × G from k','Recovering k from k × G','Adding two points','Checking that a point is on the curve'],a:1,why:'That is the elliptic curve discrete logarithm problem; the best known attacks take about √n steps.'},
 code:{
python:`P, A, B = 97, 2, 3                 # toy curve y^2 = x^3 + 2x + 3 (mod 97)
G = (3, 6)
INF = None                         # the point at infinity

def add(p, q):
    if p is INF:
        return q
    if q is INF:
        return p
    (x1, y1), (x2, y2) = p, q
    if x1 == x2 and (y1 + y2) % P == 0:
        return INF
    if p == q:
        lam = (3 * x1 * x1 + A) * pow(2 * y1, -1, P)
    else:
        lam = (y2 - y1) * pow(x2 - x1, -1, P)
    x3 = (lam * lam - x1 - x2) % P
    return (x3, (lam * (x1 - x3) - y1) % P)

def multiply(k, p):                # double-and-add
    result = INF
    while k:
        if k & 1:
            result = add(result, p)
        p = add(p, p)
        k >>= 1
    return result

print(multiply(2, G))                              # (80, 10)
a, b = 7, 11                                       # private keys
A_pub, B_pub = multiply(a, G), multiply(b, G)      # public keys
print(multiply(a, B_pub) == multiply(b, A_pub), multiply(a, B_pub))   # True and the shared point`,
javascript:`const P = 97n, A = 2n;                  // toy curve y^2 = x^3 + 2x + 3 (mod 97)
const G = [3n, 6n];
const mod = x => ((x % P) + P) % P;
const inv = x => { let r = 1n, b = mod(x), e = P - 2n; while (e) { if (e & 1n) r = r * b % P; b = b * b % P; e >>= 1n; } return r; };

function add(p, q) {
  if (!p) return q;
  if (!q) return p;                     // null = point at infinity
  const [x1, y1] = p, [x2, y2] = q;
  if (x1 === x2 && mod(y1 + y2) === 0n) return null;
  const lam = x1 === x2 && y1 === y2 ? mod((3n * x1 * x1 + A) * inv(2n * y1)) : mod((y2 - y1) * inv(x2 - x1));
  const x3 = mod(lam * lam - x1 - x2);
  return [x3, mod(lam * (x1 - x3) - y1)];
}

function multiply(k, p) {               // double-and-add
  let result = null;
  for (; k > 0n; k >>= 1n) { if (k & 1n) result = add(result, p); p = add(p, p); }
  return result;
}

console.log(multiply(2n, G).join(", "));   // 80, 10
const a = 7n, b = 11n, Apub = multiply(a, G), Bpub = multiply(b, G);
const s1 = multiply(a, Bpub), s2 = multiply(b, Apub);
console.log(s1[0] === s2[0] && s1[1] === s2[1], s1.join(", "));`,
java:`public class ToyCurve {
    static final long P = 97, A = 2;                 // y^2 = x^3 + 2x + 3 (mod 97)

    static long mod(long x) { return ((x % P) + P) % P; }
    static long inv(long x) {                        // Fermat: x^(p-2) mod p
        long r = 1, b = mod(x), e = P - 2;
        while (e > 0) { if ((e & 1) == 1) r = r * b % P; b = b * b % P; e >>= 1; }
        return r;
    }

    static long[] add(long[] p, long[] q) {          // null = point at infinity
        if (p == null) return q;
        if (q == null) return p;
        if (p[0] == q[0] && mod(p[1] + q[1]) == 0) return null;
        long lam = (p[0] == q[0] && p[1] == q[1])
                ? mod((3 * p[0] * p[0] + A) * inv(2 * p[1]))
                : mod((q[1] - p[1]) * inv(q[0] - p[0]));
        long x3 = mod(lam * lam - p[0] - q[0]);
        return new long[]{x3, mod(lam * (p[0] - x3) - p[1])};
    }

    static long[] multiply(long k, long[] p) {       // double-and-add
        long[] result = null;
        for (; k > 0; k >>= 1) { if ((k & 1) == 1) result = add(result, p); p = add(p, p); }
        return result;
    }

    public static void main(String[] args) {
        long[] G = {3, 6};
        long[] g2 = multiply(2, G);
        System.out.println(g2[0] + ", " + g2[1]);                       // 80, 10
        long[] s1 = multiply(7, multiply(11, G)), s2 = multiply(11, multiply(7, G));
        System.out.println((s1[0] == s2[0] && s1[1] == s2[1]) + " " + s1[0] + ", " + s1[1]);
    }
}`,
cpp:`#include <iostream>
#include <optional>
#include <utility>

using Point = std::optional<std::pair<long long, long long>>;   // nullopt = point at infinity
const long long P = 97, A = 2;                                  // y^2 = x^3 + 2x + 3 (mod 97)

long long mod(long long x) { return ((x % P) + P) % P; }
long long inv(long long x) {
    long long r = 1, b = mod(x), e = P - 2;
    while (e) { if (e & 1) r = r * b % P; b = b * b % P; e >>= 1; }
    return r;
}

Point add(Point p, Point q) {
    if (!p) return q;
    if (!q) return p;
    auto [x1, y1] = *p; auto [x2, y2] = *q;
    if (x1 == x2 && mod(y1 + y2) == 0) return std::nullopt;
    long long lam = (x1 == x2 && y1 == y2) ? mod((3 * x1 * x1 + A) * inv(2 * y1))
                                           : mod((y2 - y1) * inv(x2 - x1));
    long long x3 = mod(lam * lam - x1 - x2);
    return std::make_pair(x3, mod(lam * (x1 - x3) - y1));
}

Point multiply(long long k, Point p) {                           // double-and-add
    Point result = std::nullopt;
    for (; k > 0; k >>= 1) { if (k & 1) result = add(result, p); p = add(p, p); }
    return result;
}

int main() {
    Point G = std::make_pair(3LL, 6LL);
    auto g2 = *multiply(2, G);
    std::cout << g2.first << ", " << g2.second << '\\n';           // 80, 10
    auto s1 = *multiply(7, multiply(11, G)), s2 = *multiply(11, multiply(7, G));
    std::cout << std::boolalpha << (s1 == s2) << ' ' << s1.first << ", " << s1.second << '\\n';
}`}},

x25519:{name:'X25519 key exchange',cat:'publickey',
 blurb:'Elliptic-curve Diffie–Hellman on Curve25519. Two parties exchange 32-byte public keys and each computes the same 32-byte shared secret. Used by TLS 1.3, SSH, Signal and WireGuard.',
 cx:[['Key size','32 bytes','Private and public'],['Security','≈ 128 bits',''],['Speed','~50 µs per operation','Constant-time by design'],['Status','Recommended (RFC 7748)','Not quantum-safe; often paired with ML-KEM in hybrid mode']],
 pts:['Designed by Daniel J. Bernstein to be fast and hard to implement insecurely: every 32-byte string is a valid public key, so no point validation is needed.','Uses only the x-coordinate and the Montgomery ladder, which runs in constant time.','Feed the raw shared secret through HKDF before using it as a key.','Plain X25519 is unauthenticated: combine it with signatures or certificates to stop man-in-the-middle attacks.'],
 pseudo:['procedure X25519(scalar k, u-coordinate u)','  clamp k: clear bits 0–2 and 255, set bit 254','  run the Montgomery ladder over the 255 bits of k','  return the x-coordinate of k × (u, ·)','Alice: A ← X25519(a, 9);  Bob: B ← X25519(b, 9)','shared ← X25519(a, B) = X25519(b, A)'],
 trace:[[0,'RFC 7748 §6.1 test keys for Alice and Bob.'],[1,'Clamping makes the private scalar a multiple of 8 with a fixed top bit, avoiding small-subgroup and timing problems.'],[4,'Each side computes its public key from the base point u = 9 and sends it.'],[5,'Both compute shared secret 4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742.'],[0,'An eavesdropper sees only the two public keys.']],
 q:{q:'What should you do with the raw X25519 shared secret before using it to encrypt?',o:['Use it directly as an AES key','Pass it through a KDF such as HKDF','Base64-encode it','Hash it with MD5'],a:1,why:'A KDF turns the shared point into uniformly random, purpose-specific keys (and can bind in transcript data).'},
 code:{
python:`from cryptography.hazmat.primitives.asymmetric.x25519 import X25519PrivateKey

alice = X25519PrivateKey.from_private_bytes(bytes.fromhex(
    "77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a"))   # RFC 7748 test keys
bob = X25519PrivateKey.from_private_bytes(bytes.fromhex(
    "5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb"))
# In real code: X25519PrivateKey.generate()

s1 = alice.exchange(bob.public_key())
s2 = bob.exchange(alice.public_key())
print(s1 == s2, s1.hex())
# True 4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742`,
javascript:`const crypto = require("crypto");

// Wrap a raw 32-byte X25519 private key in PKCS#8 DER so Node can load it.
const fromRaw = hex => crypto.createPrivateKey({
  key: Buffer.concat([Buffer.from("302e020100300506032b656e04220420", "hex"), Buffer.from(hex, "hex")]),
  format: "der", type: "pkcs8",
});

const alice = fromRaw("77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a");  // RFC 7748
const bob = fromRaw("5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb");
// In real code: crypto.generateKeyPairSync("x25519")

const s1 = crypto.diffieHellman({ privateKey: alice, publicKey: crypto.createPublicKey(bob) });
const s2 = crypto.diffieHellman({ privateKey: bob, publicKey: crypto.createPublicKey(alice) });
console.log(s1.equals(s2), s1.toString("hex"));
// true 4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742`,
java:`import java.math.BigInteger;
import java.security.*;
import java.security.spec.*;
import java.util.HexFormat;
import javax.crypto.KeyAgreement;

public class X25519Demo {
    static final HexFormat HEX = HexFormat.of();

    static PrivateKey priv(String hex) throws Exception {
        return KeyFactory.getInstance("XDH")
                .generatePrivate(new XECPrivateKeySpec(NamedParameterSpec.X25519, HEX.parseHex(hex)));
    }

    static PublicKey pub(String hex) throws Exception {          // u-coordinate is little-endian
        byte[] b = HEX.parseHex(hex);
        for (int i = 0; i < b.length / 2; i++) { byte t = b[i]; b[i] = b[b.length - 1 - i]; b[b.length - 1 - i] = t; }
        return KeyFactory.getInstance("XDH")
                .generatePublic(new XECPublicKeySpec(NamedParameterSpec.X25519, new BigInteger(1, b)));
    }

    static byte[] agree(PrivateKey mine, PublicKey theirs) throws Exception {
        KeyAgreement ka = KeyAgreement.getInstance("XDH");
        ka.init(mine);
        ka.doPhase(theirs, true);
        return ka.generateSecret();
    }

    public static void main(String[] args) throws Exception {
        // RFC 7748 test keys. In real code: KeyPairGenerator.getInstance("X25519").generateKeyPair()
        PrivateKey alice = priv("77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a");
        PrivateKey bob = priv("5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb");
        PublicKey alicePub = pub("8520f0098930a754748b7ddcb43ef75a0dbf3a0d26381af4eba4a98eaa9b4e6a");
        PublicKey bobPub = pub("de9edb7d7b7dc1b4d35b61c2ece435373f8343c85b78674dadfc7e146f882b4f");
        byte[] s1 = agree(alice, bobPub), s2 = agree(bob, alicePub);
        System.out.println(MessageDigest.isEqual(s1, s2) + " " + HEX.formatHex(s1));
        // true 4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742
    }
}`,
cpp:`// Compile with: g++ x25519.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>
#include <vector>

${CPP_HEX}

EVP_PKEY* fromRaw(const char* hexKey) {
    unsigned char raw[32];
    for (int i = 0; i < 32; i++) sscanf(hexKey + 2 * i, "%2hhx", &raw[i]);
    return EVP_PKEY_new_raw_private_key(EVP_PKEY_X25519, nullptr, raw, 32);
}

std::string derive(EVP_PKEY* mine, EVP_PKEY* peer) {
    EVP_PKEY_CTX* ctx = EVP_PKEY_CTX_new(mine, nullptr);
    EVP_PKEY_derive_init(ctx);
    EVP_PKEY_derive_set_peer(ctx, peer);           // only the peer's public half is used
    unsigned char out[32];
    size_t len = sizeof out;
    EVP_PKEY_derive(ctx, out, &len);
    EVP_PKEY_CTX_free(ctx);
    return hex(out, len);
}

int main() {
    EVP_PKEY* alice = fromRaw("77076d0a7318a57d3c16c17251b26645df4c2f87ebc0992ab177fba51db92c2a");  // RFC 7748
    EVP_PKEY* bob = fromRaw("5dab087e624a8a4b79e17f8b83800ee66f3bb1292618b6fd1c2f8b27ff88e0eb");
    std::string s1 = derive(alice, bob), s2 = derive(bob, alice);
    std::cout << std::boolalpha << (s1 == s2) << ' ' << s1 << '\\n';
    // true 4a5d9d5ba4ce2de1728e3bf480350f25e07e21c947d19e3376f09b3c1e161742
}`}},

ecdsa:{name:'ECDSA signatures',cat:'signatures',
 blurb:'The Elliptic Curve Digital Signature Algorithm proves that a message came from the holder of a private key. Used in TLS certificates, Bitcoin, Ethereum and passkeys (P-256).',
 cx:[['Signature size','64 bytes (P-256)','Two 32-byte numbers r and s'],['Sign / verify','≈ 50 µs / 100 µs',''],['Nonce k','Must be unique and secret','Deterministic k per RFC 6979 avoids RNG failures'],['Status','Widely deployed','Not quantum-safe; ML-DSA is the post-quantum successor']],
 pts:['Sign: pick a secret nonce k, compute r = (k × G).x and s = k⁻¹(H(m) + r · d) mod n.','Verify: check that ((H(m) · s⁻¹) × G + (r · s⁻¹) × Q).x = r using only the public key Q.','Reusing k for two signatures reveals the private key: this is exactly how Sony’s PlayStation 3 signing key was extracted in 2010.','Signatures give authenticity and integrity, plus non-repudiation: only the private-key holder could have signed.'],
 pseudo:['procedure Sign(d, m)   // d = private key, curve order n','  e ← H(m)','  k ← unique secret nonce in [1, n−1]','  r ← (k × G).x mod n','  s ← k⁻¹ (e + r·d) mod n','  return (r, s)','Verify(Q, m, r, s): w ← s⁻¹; X ← (e·w) × G + (r·w) × Q; accept iff X.x mod n = r'],
 trace:[[0,'Generate a P-256 key pair: private d, public Q = d × G.'],[1,'Hash the message with SHA-256.'],[2,'Pick a fresh secret k (or derive it deterministically from d and the hash).'],[5,'The signature is the pair (r, s).'],[6,'Anyone with Q can verify; changing one byte of the message makes verification fail.']],
 q:{q:'Two ECDSA signatures were made with the same nonce k. What can an attacker do?',o:['Nothing','Recover the private key','Only learn the message hash','Forge one more signature at most'],a:1,why:'With two equations sharing k, solving for k and then d is simple algebra. Never reuse k; use RFC 6979 or Ed25519.'},
 code:{
python:`from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import ec

private_key = ec.generate_private_key(ec.SECP256R1())      # P-256
public_key = private_key.public_key()
msg = b"pay Alice 10 coins"

signature = private_key.sign(msg, ec.ECDSA(hashes.SHA256()))

def ok(m):
    try:
        public_key.verify(signature, m, ec.ECDSA(hashes.SHA256()))
        return True
    except InvalidSignature:
        return False

print(ok(msg), ok(b"pay Alice 99 coins"))   # True False`,
javascript:`const crypto = require("crypto");

const { publicKey, privateKey } = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });   // P-256
const msg = Buffer.from("pay Alice 10 coins");

const signature = crypto.sign("sha256", msg, privateKey);
const ok = m => crypto.verify("sha256", Buffer.from(m), publicKey, signature);
console.log(ok("pay Alice 10 coins"), ok("pay Alice 99 coins"));   // true false`,
java:`import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.ECGenParameterSpec;

public class EcdsaDemo {
    public static void main(String[] args) throws Exception {
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        kpg.initialize(new ECGenParameterSpec("secp256r1"));        // P-256
        KeyPair kp = kpg.generateKeyPair();

        Signature signer = Signature.getInstance("SHA256withECDSA");
        signer.initSign(kp.getPrivate());
        signer.update("pay Alice 10 coins".getBytes(StandardCharsets.UTF_8));
        byte[] sig = signer.sign();

        System.out.println(verify(kp.getPublic(), "pay Alice 10 coins", sig) + " "
                + verify(kp.getPublic(), "pay Alice 99 coins", sig));   // true false
    }

    static boolean verify(PublicKey key, String msg, byte[] sig) throws Exception {
        Signature v = Signature.getInstance("SHA256withECDSA");
        v.initVerify(key);
        v.update(msg.getBytes(StandardCharsets.UTF_8));
        return v.verify(sig);
    }
}`,
cpp:`// Compile with: g++ ecdsa.cpp -lcrypto   (OpenSSL 3)
#include <openssl/evp.h>
#include <openssl/ec.h>
#include <iostream>
#include <string>
#include <vector>

std::vector<unsigned char> sign(EVP_PKEY* key, const std::string& msg) {
    EVP_MD_CTX* md = EVP_MD_CTX_new();
    EVP_DigestSignInit(md, nullptr, EVP_sha256(), nullptr, key);
    size_t len = 0;
    EVP_DigestSign(md, nullptr, &len, (const unsigned char*)msg.data(), msg.size());
    std::vector<unsigned char> sig(len);
    EVP_DigestSign(md, sig.data(), &len, (const unsigned char*)msg.data(), msg.size());
    sig.resize(len);
    EVP_MD_CTX_free(md);
    return sig;
}

bool verify(EVP_PKEY* key, const std::string& msg, const std::vector<unsigned char>& sig) {
    EVP_MD_CTX* md = EVP_MD_CTX_new();
    EVP_DigestVerifyInit(md, nullptr, EVP_sha256(), nullptr, key);
    bool ok = EVP_DigestVerify(md, sig.data(), sig.size(), (const unsigned char*)msg.data(), msg.size()) == 1;
    EVP_MD_CTX_free(md);
    return ok;
}

int main() {
    EVP_PKEY* key = EVP_EC_gen("P-256");
    auto sig = sign(key, "pay Alice 10 coins");
    std::cout << std::boolalpha << verify(key, "pay Alice 10 coins", sig) << ' '
              << verify(key, "pay Alice 99 coins", sig) << '\\n';   // true false
    EVP_PKEY_free(key);
}`}},

ed25519:{name:'Ed25519 signatures',cat:'signatures',
 blurb:'A modern Edwards-curve signature scheme: small keys, fast, deterministic (no random nonce to get wrong), and resistant to many implementation mistakes. The default for SSH keys and many new protocols.',
 cx:[['Keys','32-byte private seed, 32-byte public key',''],['Signature','64 bytes',''],['Speed','Faster than ECDSA P-256','Batch verification available'],['Status','Recommended (RFC 8032)','Not quantum-safe']],
 pts:['The nonce is derived by hashing the private key with the message, so the same message always gives the same signature and no RNG is needed at signing time.','Built on the twisted Edwards form of Curve25519, which has complete addition formulas (no special cases to leak through timing).','Used by OpenSSH, Signal, Tor, WireGuard handshakes, and package signing (e.g. minisign).','Because signing is deterministic, the RFC test vector below gives identical bytes in every language.'],
 pseudo:['procedure Sign(seed, M)','  (a, prefix) ← split SHA-512(seed); clamp a','  A ← a × B   // public key','  r ← SHA-512(prefix ‖ M) mod L   // deterministic nonce','  R ← r × B','  S ← (r + SHA-512(R ‖ A ‖ M) · a) mod L','  return R ‖ S','Verify: accept iff S × B = R + SHA-512(R ‖ A ‖ M) × A'],
 trace:[[0,'RFC 8032 test 1: seed 9d61b19d…7f60 and the empty message.'],[2,'Public key: d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a.'],[3,'The nonce comes from hashing secret material with the message, not from an RNG.'],[6,'Signature begins e5564300c360ac72… and is identical every time.'],[7,'Verification uses only the public key and checks one curve equation.']],
 q:{q:'Ed25519 signing doesn’t need a random number generator. Why is that an advantage?',o:['It makes signatures shorter','It removes the risk of a bad or repeated nonce leaking the private key','It makes verification optional','It hides the message'],a:1,why:'ECDSA failures from weak or reused nonces have leaked real private keys; deterministic nonces eliminate that whole class of bugs.'},
 code:{
python:`from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey

seed = bytes.fromhex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60")  # RFC 8032 test 1
key = Ed25519PrivateKey.from_private_bytes(seed)           # real code: Ed25519PrivateKey.generate()
signature = key.sign(b"")
print(signature.hex()[:32])        # e5564300c360ac729086e2cc806e828a
key.public_key().verify(signature, b"")                    # raises InvalidSignature if bad
print("verified")`,
javascript:`const crypto = require("crypto");

const seed = Buffer.from("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60", "hex");  // RFC 8032
const privateKey = crypto.createPrivateKey({
  key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), seed]),   // PKCS#8 wrapper
  format: "der", type: "pkcs8",
});                                     // real code: crypto.generateKeyPairSync("ed25519")
const signature = crypto.sign(null, Buffer.alloc(0), privateKey);
console.log(signature.toString("hex").slice(0, 32));    // e5564300c360ac729086e2cc806e828a
console.log(crypto.verify(null, Buffer.alloc(0), crypto.createPublicKey(privateKey), signature) ? "verified" : "bad");`,
java:`import java.math.BigInteger;
import java.security.*;
import java.security.spec.*;
import java.util.HexFormat;

public class Ed25519Demo {
    static final HexFormat HEX = HexFormat.of();

    static PublicKey publicFromBytes(byte[] enc) throws Exception {   // decode an RFC 8032 public key
        boolean xOdd = (enc[31] & 0x80) != 0;
        byte[] y = enc.clone();
        y[31] &= 0x7f;
        for (int i = 0; i < 16; i++) { byte t = y[i]; y[i] = y[31 - i]; y[31 - i] = t; }   // little-endian
        EdECPoint point = new EdECPoint(xOdd, new BigInteger(1, y));
        return KeyFactory.getInstance("Ed25519").generatePublic(new EdECPublicKeySpec(NamedParameterSpec.ED25519, point));
    }

    public static void main(String[] args) throws Exception {
        byte[] seed = HEX.parseHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60");   // RFC 8032
        PrivateKey priv = KeyFactory.getInstance("Ed25519")
                .generatePrivate(new EdECPrivateKeySpec(NamedParameterSpec.ED25519, seed));
        Signature s = Signature.getInstance("Ed25519");
        s.initSign(priv);
        s.update(new byte[0]);
        byte[] sig = s.sign();
        System.out.println(HEX.formatHex(sig).substring(0, 32));   // e5564300c360ac729086e2cc806e828a

        PublicKey pub = publicFromBytes(HEX.parseHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
        Signature v = Signature.getInstance("Ed25519");
        v.initVerify(pub);
        v.update(new byte[0]);
        System.out.println(v.verify(sig) ? "verified" : "bad");
    }
}`,
cpp:`// Compile with: g++ ed25519.cpp -lcrypto
#include <openssl/evp.h>
#include <iostream>
#include <string>

${CPP_HEX}

int main() {
    const char* seedHex = "9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60";   // RFC 8032 test 1
    unsigned char seed[32], sig[64];
    for (int i = 0; i < 32; i++) sscanf(seedHex + 2 * i, "%2hhx", &seed[i]);
    EVP_PKEY* key = EVP_PKEY_new_raw_private_key(EVP_PKEY_ED25519, nullptr, seed, 32);
    const unsigned char empty[1] = {0};

    EVP_MD_CTX* md = EVP_MD_CTX_new();
    EVP_DigestSignInit(md, nullptr, nullptr, nullptr, key);    // Ed25519 takes no separate digest
    size_t len = sizeof sig;
    EVP_DigestSign(md, sig, &len, empty, 0);
    std::cout << hex(sig, len).substr(0, 32) << '\\n';          // e5564300c360ac729086e2cc806e828a

    EVP_MD_CTX_reset(md);
    EVP_DigestVerifyInit(md, nullptr, nullptr, nullptr, key);
    std::cout << (EVP_DigestVerify(md, sig, len, empty, 0) == 1 ? "verified" : "bad") << '\\n';
    EVP_MD_CTX_free(md);
    EVP_PKEY_free(key);
}`}},

lwe:{name:'Learning With Errors (post-quantum)',cat:'advanced',
 blurb:'The hard problem behind ML-KEM (Kyber) and ML-DSA, the new post-quantum standards. Linear equations are easy to solve, until a little random noise is added to each one.',
 cx:[['Hard problem','Solve A·s + e = b for s','e is small random noise'],['Quantum resistance','Yes','No known quantum speed-up beyond generic search'],['Key size','≈ 1 KB (ML-KEM-768)','Bigger than ECC, smaller than many alternatives'],['Status','NIST standards (2024)','FIPS 203 (ML-KEM), FIPS 204 (ML-DSA)']],
 pts:['Shor’s algorithm on a large quantum computer would break RSA, Diffie–Hellman and elliptic curves; lattice problems like LWE are believed to resist it.','Public key: a random matrix A and b = A·s + e (mod q). Without the noise e, Gaussian elimination recovers s instantly.','Encrypting one bit: add up a random subset of the rows, then add q/2 to signal a 1. The noise stays small enough to round away when decrypting.','Real ML-KEM works over polynomial rings (“Module-LWE”) for efficiency. Browsers and TLS libraries already deploy X25519 + ML-KEM hybrids.'],
 pseudo:['KeyGen: s ← random vector; A ← random m × n matrix mod q','        e ← small noise vector; b ← A·s + e mod q','        public (A, b), private s','Encrypt(bit): S ← random subset of the rows','        u ← Σ A[i]; v ← Σ b[i] + bit · ⌊q/2⌋   (mod q)','Decrypt(u, v): d ← v − u·s mod q','        return 1 if d is closer to q/2 than to 0, else 0'],
 trace:[[0,'Toy parameters: n = 16 unknowns, m = 32 noisy equations, q = 257, noise in {−1, 0, 1}.'],[1,'Each equation is off by a tiny error, so linear algebra no longer works.'],[4,'To send bit 1: sum a random subset of equations and add 128 (≈ q/2).'],[5,'Decryption subtracts u·s; what’s left is the bit × 128 plus the summed noise (at most ±32).'],[6,'Values near 0 decode as 0, values near 128 as 1. All 8 bits of the test byte round-trip correctly.']],
 q:{q:'Why do post-quantum schemes like ML-KEM matter even before large quantum computers exist?',o:['They are faster than AES','Attackers can record encrypted traffic today and decrypt it once quantum computers arrive','RSA is already broken classically','They need no keys'],a:1,why:'“Harvest now, decrypt later”: long-lived secrets need protection against future quantum attacks today.'},
 code:{
python:`# Toy LWE (Regev) encryption of single bits. Educational only; use ML-KEM in practice.
Q, N, M = 257, 16, 32
state = 12345

def rand(k):                       # deterministic MINSTD generator so every language matches
    global state
    state = state * 48271 % 2147483647
    return state % k

s = [rand(Q) for _ in range(N)]                                    # private key
A = [[rand(Q) for _ in range(N)] for _ in range(M)]
b = [(sum(A[i][j] * s[j] for j in range(N)) + rand(3) - 1) % Q for i in range(M)]   # + small noise

def encrypt(bit):
    rows = [i for i in range(M) if rand(2)]                        # random subset of equations
    u = [sum(A[i][j] for i in rows) % Q for j in range(N)]
    v = (sum(b[i] for i in rows) + bit * (Q // 2)) % Q
    return u, v

def decrypt(u, v):
    d = (v - sum(u[j] * s[j] for j in range(N))) % Q
    return 1 if Q // 4 < d < 3 * Q // 4 else 0

bits = [1, 0, 1, 1, 0, 0, 1, 0]
out = [decrypt(*encrypt(x)) for x in bits]
print(out, out == bits)            # [1, 0, 1, 1, 0, 0, 1, 0] True`,
javascript:`// Toy LWE (Regev) encryption of single bits. Educational only; use ML-KEM in practice.
const Q = 257, N = 16, M = 32;
let state = 12345;
const rand = k => (state = (state * 48271) % 2147483647) % k;   // deterministic MINSTD
const sum = a => a.reduce((x, y) => x + y, 0);

const s = Array.from({ length: N }, () => rand(Q));                         // private key
const A = Array.from({ length: M }, () => Array.from({ length: N }, () => rand(Q)));
const b = A.map(row => (sum(row.map((a, j) => a * s[j])) + rand(3) - 1 + Q) % Q);   // + small noise

function encrypt(bit) {
  const rows = [...Array(M).keys()].filter(() => rand(2));                  // random subset
  const u = [...Array(N).keys()].map(j => sum(rows.map(i => A[i][j])) % Q);
  const v = (sum(rows.map(i => b[i])) + bit * Math.floor(Q / 2)) % Q;
  return [u, v];
}

function decrypt([u, v]) {
  const d = (((v - sum(u.map((x, j) => x * s[j]))) % Q) + Q) % Q;
  return d > Q / 4 && d < (3 * Q) / 4 ? 1 : 0;
}

const bits = [1, 0, 1, 1, 0, 0, 1, 0];
const out = bits.map(x => decrypt(encrypt(x)));
console.log(JSON.stringify(out), out.join() === bits.join());   // [1,0,1,1,0,0,1,0] true`,
java:`import java.util.*;

public class ToyLwe {
    static final int Q = 257, N = 16, M = 32;
    static long state = 12345;
    static int rand(int k) { state = state * 48271 % 2147483647L; return (int) (state % k); }   // MINSTD

    static int[] s = new int[N], b = new int[M];
    static int[][] A = new int[M][N];

    static int[] encrypt(int bit) {                      // returns u[0..N-1] followed by v
        List<Integer> rows = new ArrayList<>();
        for (int i = 0; i < M; i++) if (rand(2) == 1) rows.add(i);
        int[] c = new int[N + 1];
        for (int j = 0; j < N; j++) { long t = 0; for (int i : rows) t += A[i][j]; c[j] = (int) (t % Q); }
        long v = bit * (Q / 2);
        for (int i : rows) v += b[i];
        c[N] = (int) (v % Q);
        return c;
    }

    static int decrypt(int[] c) {
        long d = c[N];
        for (int j = 0; j < N; j++) d -= (long) c[j] * s[j];
        d = ((d % Q) + Q) % Q;
        return d > Q / 4 && d < 3 * Q / 4 ? 1 : 0;
    }

    public static void main(String[] args) {
        for (int j = 0; j < N; j++) s[j] = rand(Q);                          // private key
        for (int i = 0; i < M; i++) for (int j = 0; j < N; j++) A[i][j] = rand(Q);
        for (int i = 0; i < M; i++) {
            long t = 0;
            for (int j = 0; j < N; j++) t += (long) A[i][j] * s[j];
            b[i] = (int) (((t + rand(3) - 1) % Q + Q) % Q);                  // + small noise
        }
        int[] bits = {1, 0, 1, 1, 0, 0, 1, 0}, out = new int[bits.length];
        for (int k = 0; k < bits.length; k++) out[k] = decrypt(encrypt(bits[k]));
        System.out.println(Arrays.toString(out) + " " + Arrays.equals(out, bits));   // [1, 0, 1, 1, 0, 0, 1, 0] true
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <cstdint>

// Toy LWE (Regev) encryption of single bits. Educational only; use ML-KEM in practice.
const int Q = 257, N = 16, M = 32;
uint64_t state = 12345;
int rnd(int k) { state = state * 48271 % 2147483647ULL; return state % k; }   // MINSTD

std::vector<int> s(N), b(M);
std::vector<std::vector<int>> A(M, std::vector<int>(N));

std::pair<std::vector<int>, int> encrypt(int bit) {
    std::vector<int> rows;
    for (int i = 0; i < M; i++) if (rnd(2)) rows.push_back(i);   // random subset
    std::vector<int> u(N);
    for (int j = 0; j < N; j++) { long t = 0; for (int i : rows) t += A[i][j]; u[j] = t % Q; }
    long v = bit * (Q / 2);
    for (int i : rows) v += b[i];
    return {u, int(v % Q)};
}

int decrypt(const std::pair<std::vector<int>, int>& c) {
    long d = c.second;
    for (int j = 0; j < N; j++) d -= long(c.first[j]) * s[j];
    d = ((d % Q) + Q) % Q;
    return d > Q / 4 && d < 3 * Q / 4;
}

int main() {
    for (int j = 0; j < N; j++) s[j] = rnd(Q);                                // private key
    for (int i = 0; i < M; i++) for (int j = 0; j < N; j++) A[i][j] = rnd(Q);
    for (int i = 0; i < M; i++) {
        long t = 0;
        for (int j = 0; j < N; j++) t += long(A[i][j]) * s[j];
        b[i] = ((t + rnd(3) - 1) % Q + Q) % Q;                               // + small noise
    }
    std::vector<int> bits = {1, 0, 1, 1, 0, 0, 1, 0}, out;
    for (int x : bits) out.push_back(decrypt(encrypt(x)));
    for (int x : out) std::cout << x << ' ';
    std::cout << std::boolalpha << (out == bits) << '\\n';   // 1 0 1 1 0 0 1 0 true
}`}},

shamir:{name:'Shamir’s secret sharing',cat:'advanced',
 blurb:'Split a secret into n shares so that any k of them can rebuild it, while k − 1 shares reveal nothing at all. Used for backup keys, crypto wallets and multi-party control.',
 cx:[['Split','O(n · k)','Evaluate a degree-(k−1) polynomial at n points'],['Recover','O(k²)','Lagrange interpolation at x = 0'],['Security','Information-theoretic','Fewer than k shares give zero information, even to unlimited computing power'],['Share size','Same as the secret','']],
 pts:['Hide the secret as f(0) of a random polynomial of degree k − 1; each share is a point (x, f(x)).','k points determine a degree-(k−1) polynomial uniquely; k − 1 points fit every possible secret equally well.','All arithmetic is done modulo a prime so shares don’t leak size information.','Used by HashiCorp Vault unsealing, many hardware wallets, and DNSSEC root key ceremonies.'],
 pseudo:['procedure split(secret, k, n)','  f(x) ← secret + c₁x + … + c_(k−1)x^(k−1) mod p   // random cᵢ','  return shares (i, f(i)) for i = 1..n','procedure recover(shares)   // any k of them','  secret ← Σⱼ yⱼ · Π_(m≠j) xₘ / (xₘ − xⱼ)   (mod p)','  return secret'],
 trace:[[1,'Secret 1234, threshold k = 3: f(x) = 1234 + 166x + 94x² (the coefficients would normally be random).'],[2,'Six shares: (1, 1494), (2, 1942), (3, 2578), (4, 3402), (5, 4414), (6, 5614).'],[4,'Take any three, say x = 2, 4, 5. Lagrange interpolation at x = 0 gives 1234.'],[0,'With only two shares, every secret value is equally consistent with what you hold.'],[5,'The modular version works the same with all arithmetic mod p = 2³¹ − 1.']],
 q:{q:'A secret is split with threshold k = 3 among 5 people. Two of them collude. What do they learn?',o:['Two thirds of the secret','The secret’s first digits','Nothing at all about the secret','The secret, if they guess a third share'],a:2,why:'Any value of f(0) is equally consistent with two points on a degree-2 polynomial: perfect secrecy below the threshold.'},
 code:{
python:`P = 2**31 - 1                                # prime field

def split(secret, coeffs, n):
    """coeffs = [c1, c2, ...] should be random; fixed here so the output is reproducible."""
    poly = [secret] + coeffs
    return [(x, sum(c * pow(x, i, P) for i, c in enumerate(poly)) % P) for x in range(1, n + 1)]

def recover(shares):
    secret = 0
    for j, (xj, yj) in enumerate(shares):
        num = den = 1
        for m, (xm, _) in enumerate(shares):
            if m != j:
                num = num * xm % P
                den = den * (xm - xj) % P
        secret = (secret + yj * num * pow(den, -1, P)) % P
    return secret

shares = split(1234, [166, 94], 6)            # threshold 3
print(shares[:3])                             # [(1, 1494), (2, 1942), (3, 2578)]
print(recover([shares[1], shares[3], shares[4]]))   # 1234`,
javascript:`const P = 2n ** 31n - 1n;                       // prime field
const mod = x => ((x % P) + P) % P;
const powmod = (b, e) => { let r = 1n; b = mod(b); for (; e > 0n; e >>= 1n) { if (e & 1n) r = r * b % P; b = b * b % P; } return r; };

function split(secret, coeffs, n) {             // coeffs should be random in practice
  const poly = [BigInt(secret), ...coeffs.map(BigInt)];
  return Array.from({ length: n }, (_, k) => {
    const x = BigInt(k + 1);
    return [x, mod(poly.reduce((acc, c, i) => acc + c * powmod(x, BigInt(i)), 0n))];
  });
}

function recover(shares) {
  let secret = 0n;
  shares.forEach(([xj, yj], j) => {
    let num = 1n, den = 1n;
    shares.forEach(([xm], m) => { if (m !== j) { num = num * xm % P; den = mod(den * (xm - xj)); } });
    secret = mod(secret + yj * num % P * powmod(den, P - 2n));
  });
  return secret;
}

const shares = split(1234, [166, 94], 6);       // threshold 3
console.log(shares.slice(0, 3).map(s => s.join(",")).join(" "));   // 1,1494 2,1942 3,2578
console.log(recover([shares[1], shares[3], shares[4]]).toString()); // 1234`,
java:`import java.util.*;

public class Shamir {
    static final long P = 2147483647L;                  // 2^31 - 1, prime

    static long mod(long x) { return ((x % P) + P) % P; }
    static long pow(long b, long e) { long r = 1; b = mod(b); for (; e > 0; e >>= 1) { if ((e & 1) == 1) r = r * b % P; b = b * b % P; } return r; }

    static long[][] split(long secret, long[] coeffs, int n) {   // coeffs should be random
        long[][] shares = new long[n][];
        for (int x = 1; x <= n; x++) {
            long y = secret % P;
            for (int i = 0; i < coeffs.length; i++) y = (y + coeffs[i] * pow(x, i + 1)) % P;
            shares[x - 1] = new long[]{x, y};
        }
        return shares;
    }

    static long recover(long[][] shares) {
        long secret = 0;
        for (int j = 0; j < shares.length; j++) {
            long num = 1, den = 1;
            for (int m = 0; m < shares.length; m++)
                if (m != j) { num = num * shares[m][0] % P; den = mod(den * (shares[m][0] - shares[j][0])); }
            secret = (secret + shares[j][1] * num % P * pow(den, P - 2)) % P;
        }
        return secret;
    }

    public static void main(String[] args) {
        long[][] s = split(1234, new long[]{166, 94}, 6);      // threshold 3
        System.out.println(Arrays.toString(s[0]) + " " + Arrays.toString(s[1]) + " " + Arrays.toString(s[2]));
        System.out.println(recover(new long[][]{s[1], s[3], s[4]}));   // 1234
    }
}`,
cpp:`#include <iostream>
#include <vector>
#include <utility>
#include <cstdint>

using u64 = unsigned long long;
const long long P = 2147483647LL;                          // 2^31 - 1, prime

long long mod(long long x) { return ((x % P) + P) % P; }
long long powm(long long b, long long e) {
    long long r = 1; b = mod(b);
    for (; e > 0; e >>= 1) { if (e & 1) r = (u64)r * b % P; b = (u64)b * b % P; }
    return r;
}

std::vector<std::pair<long long, long long>> split(long long secret, std::vector<long long> coeffs, int n) {
    std::vector<std::pair<long long, long long>> shares;   // coeffs should be random
    for (long long x = 1; x <= n; x++) {
        long long y = secret % P;
        for (size_t i = 0; i < coeffs.size(); i++) y = (y + coeffs[i] * powm(x, i + 1)) % P;
        shares.push_back({x, y});
    }
    return shares;
}

long long recover(const std::vector<std::pair<long long, long long>>& sh) {
    long long secret = 0;
    for (size_t j = 0; j < sh.size(); j++) {
        long long num = 1, den = 1;
        for (size_t m = 0; m < sh.size(); m++)
            if (m != j) { num = (u64)num * sh[m].first % P; den = mod((u64)den * mod(sh[m].first - sh[j].first) % P); }
        secret = (secret + (u64)sh[j].second * num % P * powm(den, P - 2)) % P;
    }
    return secret;
}

int main() {
    auto s = split(1234, {166, 94}, 6);                       // threshold 3
    for (int i = 0; i < 3; i++) std::cout << '(' << s[i].first << ", " << s[i].second << ") ";
    std::cout << '\\n' << recover({s[1], s[3], s[4]}) << '\\n';   // 1234
}`}}
});

/* metadata for crypto entries that already existed in the lessons */
Object.assign(ALGOS.caesar,{cat:'classical',name:'Caesar cipher',
 blurb:'Shift every letter by a fixed amount. With only 25 possible keys and unchanged letter frequencies, it falls to brute force or frequency analysis instantly.',
 trace:[[1,'Encrypt “HELLO” with k = 3.'],[2,'H(7) + 3 = K, E → H, L → O, L → O, O → R: “KHOOR”.'],[5,'To crack without the key, try every k from 0 to 25.'],[6,'Score each attempt with χ² against English letter frequencies.'],[7,'The lowest score, k = 3, gives readable English.']],
 q:{q:'How many keys must a brute-force attack try against a Caesar cipher?',o:['25','256','26!','2¹²⁸'],a:0,why:'Only shifts 1 through 25 are meaningful, so trying them all is instant.'}});
Object.assign(ALGOS.xor,{cat:'classical',name:'XOR & the one-time pad',
 blurb:'XOR each message byte with a key byte. With a truly random key as long as the message, used once, it is provably unbreakable; reuse the key and it collapses.',
 trace:[[0,'m = “HI” (48 49), key = 9f 23 (random).'],[2,'c = 48⊕9f, 49⊕23 = d7 6a.'],[4,'Decrypting is the same operation: d7⊕9f = 48 (“H”).'],[5,'If the key is truly random, every plaintext of that length is equally likely.'],[6,'Reuse the key on a second message and c1 ⊕ c2 = m1 ⊕ m2 leaks.']],
 q:{q:'What makes the one-time pad impractical for most uses?',o:['It is slow','The key must be as long as all the data and never reused','It is easy to break','It only works on text'],a:1,why:'Distributing that much secret key securely is as hard as sending the message securely in the first place.'}});
Object.assign(ALGOS.sha256,{cat:'hashes',
 blurb:'The workhorse hash of the SHA-2 family: 256-bit output, no practical attacks, used in TLS certificates, Bitcoin, Git’s newer object format and software signing.',
 trace:[[1,'Pad “hello” to 512 bits: message, a 1 bit, zeros, then the length 40.'],[2,'Start from eight constants derived from square roots of primes.'],[4,'Expand the block into 64 words.'],[6,'64 rounds of Ch, Maj, Σ functions and additions mod 2³².'],[9,'SHA-256(“hello”) = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824.']],
 q:{q:'About how many hashes would a generic attack need to find a SHA-256 collision?',o:['2³²','2⁶⁴','2¹²⁸','2²⁵⁶'],a:2,why:'The birthday bound: collisions appear after about the square root of 2²⁵⁶ outputs.'}});
Object.assign(ALGOS.rsa,{cat:'publickey',name:'RSA (textbook)',
 blurb:'The first widely used public-key cryptosystem (1977). Security rests on the difficulty of factoring the product of two large primes. Textbook RSA shows the math; real systems add OAEP padding.',
 trace:[[1,'Choose primes p = 61, q = 53.'],[2,'n = 3233.'],[3,'φ = 60 × 52 = 3120.'],[5,'e = 17, so d = 17⁻¹ mod 3120 = 2753.'],[7,'Encrypt m = 65: 65¹⁷ mod 3233 = 2790. Decrypt: 2790²⁷⁵³ mod 3233 = 65.']],
 q:{q:'Anyone who can factor n into p and q can…',o:['Only encrypt messages','Compute φ(n) and the private exponent d','Do nothing extra','Change e'],a:1,why:'φ(n) = (p − 1)(q − 1) and d = e⁻¹ mod φ(n) follow immediately.'}});
Object.assign(ALGOS.dh,{cat:'publickey',name:'Diffie–Hellman (finite field)',
 blurb:'The 1976 breakthrough: two parties agree on a shared secret over a public channel. Security rests on the discrete logarithm problem modulo a large prime.',
 trace:[[0,'Public: p = 23, g = 5 (tiny, for illustration).'],[1,'Alice picks a = 6 and sends A = 5⁶ mod 23 = 8.'],[2,'Bob picks b = 15 and sends B = 5¹⁵ mod 23 = 19.'],[3,'Alice computes 19⁶ mod 23 = 2.'],[4,'Bob computes 8¹⁵ mod 23 = 2. The same secret, never transmitted.']],
 q:{q:'What does plain Diffie–Hellman NOT protect against?',o:['Passive eavesdroppers','A man in the middle who substitutes his own public values','Brute force on small primes','Replay of old secrets'],a:1,why:'Without authentication (signatures or certificates), each side might be talking to the attacker.'}});
