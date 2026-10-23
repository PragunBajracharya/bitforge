/* ===== Detailed explanations: cryptography & hashing ===== */

/* ---------- Classical ---------- */
X('caesar', {
 idea: 'Every letter is replaced by the letter a fixed number of places later in the alphabet, wrapping from Z back to A. With shift 3, A becomes D and HELLO becomes KHOOR. The shift is the key, and decryption just shifts back.',
 steps: ['Pick a key k from 1 to 25.', 'For each letter, convert it to a number 0–25 (A = 0).', 'Compute (p + k) mod 26 and convert back to a letter. Leave spaces and punctuation alone.', 'To decrypt, compute (c − k) mod 26, which is the same as encrypting with 26 − k.'],
 why: 'It isn’t secure, and seeing why teaches two core ideas. First, the key space is tiny: an attacker tries all 25 shifts and reads the one that makes sense. Second, the cipher preserves letter frequencies: the most common ciphertext letter is probably E shifted by k, so frequency analysis recovers the key without even brute force.',
 cost: 'Encryption and decryption are O(n). Breaking it costs 25 × O(n) for brute force, which is instant. The key has less than 5 bits of entropy; modern keys have 128 or 256.',
 use: 'Never for real secrecy. ROT13 (shift 13) is still used to hide spoilers because applying it twice gives back the original. Its lesson, Kerckhoffs’s principle, is that security must come from a large secret key, not from hiding how the cipher works.'
});
X('xor', {
 idea: 'XOR each message bit with a key bit: 0 ⊕ 0 = 0, 1 ⊕ 0 = 1, 1 ⊕ 1 = 0. XOR-ing with the same key again undoes it, so encryption and decryption are the same operation. When the key is truly random, as long as the message, and never reused, this is the one-time pad.',
 steps: ['Generate a key of random bytes exactly as long as the message.', 'Ciphertext byte i = message byte i ⊕ key byte i.', 'The receiver XORs the ciphertext with the same key to recover the message, because (m ⊕ k) ⊕ k = m.', 'Destroy the key after one use.'],
 why: 'With a uniformly random key used once, every possible plaintext of that length is equally likely given the ciphertext: for any guess m′ there is a key k′ = c ⊕ m′ that produces it. The ciphertext therefore carries no information about the message (Shannon’s perfect secrecy). Reuse breaks it: c₁ ⊕ c₂ = m₁ ⊕ m₂ cancels the key, and two messages XOR-ed together are easy to unpick using guessed words (“crib dragging”).',
 cost: 'Encryption is O(n) and extremely fast. The real cost is the key: it must be as long as all data ever sent, securely delivered in advance, and never reused, which is why one-time pads are rarely practical.',
 use: 'Modern stream ciphers (ChaCha20, AES-CTR) keep the XOR but replace the giant random key with a keystream generated from a short key and a nonce. The same rule survives: never reuse a key–nonce pair. Repeating-key XOR (a short key cycled) is as weak as Vigenère.'
});
X('vigenere', {
 idea: 'Vigenère uses a keyword to choose a different Caesar shift for each letter. With key LEMON, the first letter shifts by L (11), the second by E (4), and so on, repeating the keyword. The same plaintext letter can now encrypt to different ciphertext letters.',
 steps: ['Write the keyword repeatedly under the message letters (skipping non-letters).', 'Shift each message letter by the value of the key letter beneath it: c = (p + k) mod 26.', 'To decrypt, subtract the key letter instead: p = (c − k) mod 26.'],
 why: 'It flattens single-letter frequencies, which defeated simple frequency analysis for centuries. But the key repeats. Letters that are a key-length apart were shifted by the same amount, so the ciphertext splits into L separate Caesar ciphers. Kasiski’s method (distances between repeated fragments) or the index of coincidence reveals L, and then each column falls to frequency analysis.',
 cost: 'O(n) to encrypt. The key space is 26^L, which sounds big, but the attack never searches it: finding L and solving L Caesar ciphers takes seconds.',
 use: 'Historical only. It shows why a key shorter than the message leaks structure, and how a cipher can look strong (huge key space) while being weak (the attack doesn’t need to search the key space). Make the key as long as the message and random, and it becomes a one-time pad.'
});
X('railfence', {
 idea: 'A transposition cipher keeps every letter but changes their order. The rail fence writes the message diagonally down and up across a number of rows (“rails”) in a zigzag, then reads the rows left to right.',
 steps: ['Choose the number of rails r (the key).', 'Write the letters one per column, moving down a row each time until the bottom rail, then back up to the top, and repeat.', 'Read off rail 1, then rail 2, and so on to get the ciphertext.', 'To decrypt, work out how many letters fall on each rail, cut the ciphertext into those pieces, and read them back in zigzag order.'],
 why: 'It isn’t secure. Because the letters themselves don’t change, the ciphertext has exactly the frequencies of English, which immediately reveals that it is a transposition. With at most n − 1 sensible rail counts, an attacker simply tries them all.',
 cost: 'O(n) to encrypt and decrypt. Breaking it costs at most n tries.',
 use: 'Historical and educational. Substitution (changing symbols) and transposition (moving symbols) are the two building blocks Shannon called confusion and diffusion, and modern ciphers like AES combine both in every round.'
});

/* ---------- Basics ---------- */
X('encoding', {
 idea: 'Encoding converts bytes into a restricted set of characters so they can pass through systems built for text. Hex uses 2 characters per byte (0–9, a–f). Base64 packs 3 bytes (24 bits) into 4 characters from a 64-character alphabet.',
 steps: ['Hex: split each byte into two 4-bit halves and map each half to 0–9 or a–f.', 'Base64: take 3 bytes, split the 24 bits into four 6-bit groups, and map each group (0–63) to A–Z, a–z, 0–9, + and /.', 'If the input length isn’t a multiple of 3, pad the last group with zero bits and add “=” characters so the output length is a multiple of 4.', 'Decoding reverses the mapping exactly.'],
 why: 'It provides no security at all, and that is the point. There is no key: the alphabet is public, so anyone can decode it. Treat “Base64-encoded passwords” in a config file or header (HTTP Basic auth, for example) as plaintext.',
 cost: 'O(n) both ways. Hex doubles the size; Base64 grows it by one third (4 output characters per 3 bytes).',
 use: 'Use hex for hashes and keys shown to people, Base64 for binary data in JSON, email (MIME), data URLs and PEM certificates, and Base64url (with - and _ and no padding) inside URLs and JWTs. Encrypt first, then encode, never the other way around.'
});
X('csprng', {
 idea: 'A cryptographically secure random number generator produces output that an attacker cannot predict, even after seeing earlier outputs. The operating system gathers unpredictable events (hardware noise, interrupt timings) and stretches them with a cryptographic generator.',
 steps: ['Ask the OS-backed generator for bytes: secrets/os.urandom in Python, crypto.getRandomValues or crypto.randomBytes in JavaScript, SecureRandom in Java, RAND_bytes or getrandom in C/C++.', 'Use those bytes directly for keys, nonces, salts, session IDs and reset tokens.', 'To pick a number in a range, use the library’s unbiased helper (secrets.randbelow, for example) rather than taking a random value mod n.'],
 why: 'General-purpose generators such as Python’s random (Mersenne Twister) or C’s rand() are fast and statistically uniform but deterministic: after observing 624 outputs of Mersenne Twister you can predict every future value. A CSPRNG is built from a cipher or hash so that predicting its output would mean breaking that primitive.',
 cost: 'Slightly slower than non-secure generators, but still gigabytes per second on modern systems, so there is no reason to avoid it. The real cost of getting this wrong is total: predictable keys are broken keys.',
 use: 'Never seed a generator with the time, a process ID or a counter. Don’t write your own generator. Taking random() % n introduces bias when n doesn’t divide the generator’s range. On virtual machines and embedded devices just after boot, make sure the OS pool has been seeded.'
});

/* ---------- Non-cryptographic hashing ---------- */
X('hashtable', {
 idea: 'A hash table stores key–value pairs in an array of buckets. A fast hash function turns each key into a number, and that number modulo the array size picks the bucket. FNV-1a is a simple, popular choice: for each byte, XOR it into the hash and multiply by a fixed prime.',
 steps: ['FNV-1a: start with the 32-bit offset basis 2166136261.', 'For each byte b: hash = hash ⊕ b, then hash = hash × 16777619 (mod 2³²).', 'Bucket index = hash mod number of buckets.', 'Collisions (two keys in one bucket) are handled by chaining (a small list per bucket) or open addressing (probe the next free slot).', 'When the table gets too full (load factor about 0.75), allocate a bigger array and re-insert everything.'],
 why: 'Its goal is spread, not secrecy. A good non-cryptographic hash makes similar keys land in different buckets so lists stay short. It is not secure: anyone can compute collisions, and attackers have used that to send thousands of colliding keys and turn O(1) lookups into O(n) (“hash flooding”). Languages now defend against this with keyed hashes such as SipHash and per-process random seeds.',
 cost: 'Hashing a key is O(length). Lookups, inserts and deletes are O(1) on average and O(n) in the worst case when everything collides. Resizing doubles the array, so its cost spread over all inserts is still O(1) each (amortized).',
 use: 'Use your language’s built-in dict, Map, HashMap or unordered_map. Choose fast hashes (FNV, xxHash, MurmurHash) for tables, caches, Bloom filters and deduplication; use a keyed hash (SipHash) if attackers control the keys; use a cryptographic hash only when security matters.'
});
X('crc32', {
 idea: 'A CRC treats the data as a huge binary polynomial and computes its remainder when divided by a fixed generator polynomial. The 32-bit remainder is stored next to the data; if the data changes, the remainder almost certainly changes too.',
 steps: ['Start with crc = 0xFFFFFFFF.', 'For each byte, XOR it into the low byte of crc.', 'Eight times: if the lowest bit is 1, shift right and XOR with the reflected polynomial 0xEDB88320; otherwise just shift right.', 'At the end, XOR with 0xFFFFFFFF. A 256-entry lookup table replaces the inner loop in fast implementations.'],
 why: 'CRCs are mathematically guaranteed to catch every single-bit error, every burst of errors up to 32 bits long, and all but about 1 in 4 billion random corruptions. They offer no security: CRC is linear, so an attacker can modify data and fix up the checksum (or choose 4 bytes to force any CRC they like) with simple algebra.',
 cost: 'O(n), and very fast: modern CPUs have CRC instructions that process several gigabytes per second. The output is only 32 bits.',
 use: 'Ethernet frames, ZIP and PNG files, and storage systems use CRCs to detect accidental damage. To detect deliberate tampering, use an HMAC or an authenticated cipher instead. The standard check value for the ASCII string “123456789” is 0xCBF43926.'
});

/* ---------- Cryptographic hashes ---------- */
X('sha256', {
 idea: 'SHA-256 turns any input into a fixed 256-bit digest. Change one bit of input and about half the output bits flip. It processes the message in 512-bit blocks, mixing each block into an 8-word state using additions, rotations and bitwise functions over 64 rounds.',
 steps: ['Pad the message: append a 1 bit, then zeros, then the 64-bit message length, so the total is a multiple of 512 bits.', 'Initialize eight 32-bit state words H₀…H₇ from the fractional parts of square roots of the first 8 primes.', 'For each block, expand its 16 words into 64 words, then run 64 rounds that mix the words into working variables using fixed constants (from cube roots of primes).', 'Add the working variables back into the state (the Davies–Meyer feed-forward).', 'After the last block, the state concatenated is the digest.'],
 why: 'A secure hash must be preimage resistant (given a digest, you can’t find an input), second-preimage resistant, and collision resistant (you can’t find any two inputs with the same digest). With 256 bits, a generic collision search needs about 2¹²⁸ hashes, far beyond any computer. Decades of public analysis have found no shortcut for SHA-256.',
 cost: 'O(n) time with constant memory; several hundred MB/s in software and more with SHA hardware instructions. The fixed 32-byte output means storage and comparisons are cheap whatever the input size.',
 use: 'Use it for file integrity, digital signatures (sign the hash), content addressing, Merkle trees and blockchains. Don’t use a bare hash for passwords (too fast; use Argon2) or as a MAC (use HMAC: SHA-256 is vulnerable to length extension, where H(secret ‖ msg) lets an attacker compute H(secret ‖ msg ‖ more)).'
});
X('md5', {
 idea: 'MD5 is a 128-bit hash with the same overall structure as SHA-256 (the Merkle–Damgård construction): pad the message, then mix 512-bit blocks into a 4-word state over 64 steps.',
 steps: ['Pad the message to a multiple of 512 bits with a 1 bit, zeros and the 64-bit length (little-endian).', 'Start from four fixed 32-bit words.', 'For each block, run four rounds of 16 operations, each using a nonlinear function, an addition, a constant from the sine function and a rotation.', 'Add the result into the state; the final state is the 16-byte digest.'],
 why: 'It is broken. In 2004 Wang et al. showed how to build collisions, and today two different files with the same MD5 can be generated in seconds. Chosen-prefix collisions let attackers make two meaningful documents share a hash; the Flame malware used this to forge a Microsoft code-signing certificate in 2012. Preimages are still hard, but collisions alone break signatures and certificates.',
 cost: 'Very fast, O(n). Its 128-bit output gives only 2⁶⁴ generic collision resistance even without the structural break.',
 use: 'Never for security: not for passwords, signatures, certificates or integrity against attackers. It still appears as a non-adversarial checksum (detecting accidental corruption, cache keys), but SHA-256 or BLAKE2 cost little more and avoid any doubt.'
});
X('sha1', {
 idea: 'SHA-1 produces a 160-bit digest using a Merkle–Damgård design similar to MD5 but with 80 steps and a message expansion. It secured TLS, PGP and Git for two decades.',
 steps: ['Pad the message to a multiple of 512 bits.', 'Expand each block’s 16 words into 80 words using XOR and a 1-bit rotation.', 'Run 80 steps over five 32-bit state words, switching the nonlinear function every 20 steps.', 'Add into the state; the five words make the 20-byte digest.'],
 why: 'It is broken for collisions. Theoretical attacks appeared in 2005, the first real collision (SHAttered, two different PDFs) came in 2017 at a cost of about 2⁶³ operations, and a chosen-prefix collision followed in 2020 for around $45,000 of GPU time. Browsers stopped trusting SHA-1 certificates in 2017.',
 cost: 'O(n) and fast. Its theoretical collision bound of 2⁸⁰ has been beaten by structural attacks.',
 use: 'Replace it with SHA-256, SHA-3 or BLAKE2. Git still uses SHA-1 by default but adds collision detection and supports SHA-256 repositories. HMAC-SHA1 (used in older TOTP apps) is still considered safe because HMAC doesn’t depend on collision resistance, but new designs should use SHA-256.'
});
X('sha3', {
 idea: 'SHA-3 (Keccak) uses a sponge: a 1600-bit state is split into a public “rate” part and a hidden “capacity” part. Message blocks are absorbed by XOR-ing them into the rate and scrambling the whole state; the digest is then squeezed out of the rate.',
 steps: ['Pad the message with the SHA-3 domain bits and a 10…01 pattern to a multiple of the rate (1088 bits for SHA3-256).', 'Absorb: XOR each block into the first rate bits of the state, then apply the Keccak-f permutation (24 rounds of θ, ρ, π, χ, ι).', 'Squeeze: output the first rate bits; if more output is needed, permute again and output more.', 'SHA3-256 takes the first 256 bits.'],
 why: 'The capacity part (512 bits for SHA3-256) is never directly exposed or overwritten by input, and the permutation thoroughly mixes all 1600 bits, so security is bounded by about half the capacity: 2²⁵⁶ here. Because the internal state is much larger than the output, SHA-3 is naturally immune to the length-extension attacks that affect SHA-2.',
 cost: 'O(n). In software it is usually somewhat slower than SHA-256 with hardware acceleration, but it is fast in hardware. The SHAKE variants produce output of any length.',
 use: 'Use it where an independent design from SHA-2 is wanted (diversity), when you need extendable output (SHAKE128/256 in post-quantum schemes such as ML-KEM), or as a simple MAC (KMAC). Ethereum uses Keccak-256, which differs from standard SHA3-256 only in padding, so their outputs differ.'
});
X('blake2', {
 idea: 'BLAKE2 is a hash built from a ChaCha-like mixing function. It is designed to be as secure as SHA-3 and faster than MD5 in software, with built-in support for keys, salts and any output length up to 64 bytes.',
 steps: ['Initialize eight 64-bit state words (BLAKE2b) from SHA-512’s constants, XOR-ed with a parameter block encoding output length and key length.', 'If a key is given, process it padded to a full block first.', 'Compress each 128-byte block with 12 rounds of the G function, which mixes four words with additions, XORs and rotations, and feeds in a counter and a final-block flag.', 'Output the first n bytes of the state.'],
 why: 'It builds on the extensively analyzed ChaCha core and the SHA-3 finalist BLAKE, which received years of public cryptanalysis with no practical attack. The counter and final-block flag in every compression prevent length extension, so keyed BLAKE2 is a secure MAC without the HMAC wrapper.',
 cost: 'O(n), often 1 GB/s or more per core in software. BLAKE2s targets 32-bit platforms; BLAKE3 extends the design into a tree for even more parallel speed.',
 use: 'Use it for fast file hashing and deduplication, keyed MACs, and inside Argon2 (which is built on BLAKE2b) and WireGuard. Python includes hashlib.blake2b; libsodium’s generic hash is BLAKE2b.'
});
X('merkle', {
 idea: 'A Merkle tree hashes each data block to form the leaves, then hashes pairs of hashes together level by level until a single root remains. The root is a fingerprint of all the data, and any one block can be proven to be included using just the sibling hashes along its path.',
 steps: ['Hash every data item to make the leaf level.', 'Pair adjacent hashes and hash each concatenated pair to form the next level. If a level has an odd count, duplicate (or carry up) the last hash.', 'Repeat until one hash, the root, remains.', 'Proof for item i: the list of sibling hashes from leaf to root. The verifier hashes upward and checks the result equals the trusted root.'],
 why: 'Changing any leaf changes its hash, which changes every hash above it, which changes the root. Forging a proof would require finding a collision in the hash function. Prefixing leaves and internal nodes differently (for example 0x00 and 0x01) prevents an attacker from presenting an internal node as a leaf.',
 cost: 'Building the tree costs n leaf hashes plus about n internal hashes: O(n). A proof contains log₂ n hashes and verifies in O(log n): a million items need only 20 hashes.',
 use: 'Merkle trees power Git and other content-addressed stores, Bitcoin block headers, Certificate Transparency logs, BitTorrent and IPFS chunk verification, and database replica syncing (compare roots, then descend only into subtrees that differ). Hash-based post-quantum signatures (SPHINCS+, XMSS) are built from them.'
});

/* ---------- MAC ---------- */
X('hmac', {
 idea: 'HMAC combines a secret key with a hash to produce a tag that proves a message came from someone holding the key and was not modified. It hashes twice, with the key mixed in differently each time: HMAC(K, m) = H((K ⊕ opad) ‖ H((K ⊕ ipad) ‖ m)).',
 steps: ['If the key is longer than the hash’s block size, hash it; then pad it with zeros to the block size.', 'Inner hash: H((key ⊕ 0x36…36) ‖ message).', 'Outer hash: H((key ⊕ 0x5c…5c) ‖ inner hash). That is the tag.', 'The receiver recomputes the tag with the shared key and compares the two using a constant-time comparison.'],
 why: 'Without the key, an attacker can’t compute a valid tag for any new message, even after seeing many valid tag pairs. The nested structure fixes the length-extension weakness of naive H(key ‖ message). Its security proof relies only on the hash’s compression function behaving like a pseudorandom function, which is why HMAC-SHA1 and even HMAC-MD5 have held up better than the bare hashes.',
 cost: 'Two hash calls, so O(n) plus a small constant (a few extra blocks). Tags are the hash length but can be truncated to 128 bits.',
 use: 'Use it for API request signing (AWS SigV4), webhook verification, JWT HS256, cookies, TOTP codes and inside TLS and HKDF. Always compare tags with a constant-time function (hmac.compare_digest, crypto.timingSafeEqual, MessageDigest.isEqual, CRYPTO_memcmp) to avoid timing leaks. A MAC proves integrity, not secrecy; to also hide the message, use authenticated encryption.'
});

/* ---------- KDFs / password hashing ---------- */
X('pbkdf2', {
 idea: 'PBKDF2 makes a password expensive to guess by running HMAC many thousands of times in a chain. A random salt ensures identical passwords produce different hashes, so precomputed tables are useless.',
 steps: ['Generate a random 16-byte salt per password.', 'U₁ = HMAC(password, salt ‖ block index). Then Uᵢ = HMAC(password, Uᵢ₋₁) for each iteration.', 'XOR all the Uᵢ together to make one output block; repeat with the next block index if more output is needed.', 'Store algorithm, iteration count, salt and output. To verify, recompute with the stored salt and count and compare in constant time.'],
 why: 'Stolen password hashes are attacked offline by guessing. A fast hash allows billions of guesses per second on a GPU; PBKDF2’s iteration count multiplies the cost of each guess by the same factor for the attacker as for you. Its weakness is that it needs almost no memory, so GPUs and ASICs can still run huge numbers of guesses in parallel.',
 cost: 'Time is proportional to the iteration count c. OWASP currently recommends about 600,000 iterations of HMAC-SHA256. Memory is negligible, which is exactly what memory-hard functions improve on.',
 use: 'Use it when compliance requires FIPS-approved algorithms or when nothing better is available (it ships with every platform). Otherwise prefer Argon2id or scrypt. Increase iteration counts as hardware gets faster and rehash on next login.'
});
X('scrypt', {
 idea: 'scrypt makes each password guess need a large amount of memory, not just time. It fills a big array with pseudo-random data, then reads it back in a password-dependent order, so a guesser must hold the whole array.',
 steps: ['Use PBKDF2-HMAC-SHA256 with the salt to expand the password into p blocks.', 'For each block, run ROMix: compute N successive values with the Salsa20/8-based BlockMix and store all of them (this fills memory).', 'Then do N more steps, each reading a stored value chosen by the current state and mixing it in.', 'Run PBKDF2 once more over the result to produce the key.'],
 why: 'Because the read order depends on the data, an attacker who discards the table must recompute entries on demand, which costs far more time. So each parallel guess needs its own 128 × r × N bytes of RAM, and memory is expensive to put on GPUs and ASICs. This narrows the advantage of custom hardware over your server.',
 cost: 'Memory is 128 · r · N bytes and time grows with N · r · p. Typical interactive login parameters are N = 2¹⁷, r = 8, p = 1, which uses 128 MiB.',
 use: 'Use it for password storage and for deriving keys from passphrases (disk encryption, cryptocurrency wallets). Argon2id is now preferred because it is easier to tune and resists side-channel attacks better. Use a fresh random salt for each password.'
});
X('argon2', {
 idea: 'Argon2id is the modern recommended password hash. It fills a configurable amount of memory with blocks computed by a BLAKE2b-based function, making several passes, and mixes data-independent and data-dependent memory access to resist both GPU cracking and side-channel leakage.',
 steps: ['Choose memory m (in KiB), passes t and lanes p, and generate a random salt.', 'Hash the password, salt and parameters with BLAKE2b to seed the first blocks of each lane.', 'Fill memory: each new 1 KiB block is a compression of the previous block and a reference block chosen pseudo-randomly. Argon2id chooses references independently of the password for the first half of the first pass, then based on the data.', 'Repeat for t passes; XOR the last blocks of each lane and hash them to produce the output.', 'Store the encoded string (it includes the parameters and salt) and verify with the library’s verify function.'],
 why: 'Memory hardness forces each guess to use m of RAM, eroding the advantage of GPUs and ASICs. The data-independent first half avoids leaking password information through cache timing; the data-dependent second half makes time–memory tradeoff attacks expensive. It won the 2015 Password Hashing Competition and is standardized in RFC 9106.',
 cost: 'Time grows with t × m and memory is m. OWASP suggests m = 19 MiB with t = 2 and p = 1 as a minimum; RFC 9106 recommends 2 GiB with t = 1 where resources allow, or 64 MiB with t = 3. Aim for roughly 0.5–1 seconds per hash on your servers.',
 use: 'Default choice for new systems storing passwords. Use a maintained library (argon2-cffi, libsodium, Bouncy Castle) rather than implementing it. Combine with rate limiting, and optionally a secret “pepper” kept outside the database. Don’t use it for high-entropy secrets like API keys; a fast hash is fine there.'
});
X('hkdf', {
 idea: 'HKDF turns input key material into one or more strong, independent keys. It works in two steps: extract concentrates the randomness of a possibly uneven secret into a fixed-length pseudorandom key, and expand stretches that key into as many output bytes as needed, labeled by context.',
 steps: ['Extract: PRK = HMAC(salt, input key material). If there is no salt, use zeros.', 'Expand: T(1) = HMAC(PRK, info ‖ 0x01), T(2) = HMAC(PRK, T(1) ‖ info ‖ 0x02), and so on.', 'Concatenate the T values and take the first L bytes.', 'Use a different info string (“client write key”, “server write key”) for each key you derive.'],
 why: 'A Diffie–Hellman result is secret but not uniformly random (it is a point on a curve with structure). HMAC as a randomness extractor turns it into a uniform key. Different info labels produce outputs that are independent, so compromising one derived key reveals nothing about the others.',
 cost: 'A few HMAC calls: essentially free. Output is limited to 255 × hash length bytes.',
 use: 'Use it after key exchange (TLS 1.3, Signal, WireGuard, Noise), to derive per-file or per-purpose keys from a master key, and to separate encryption and MAC keys. Never use it on passwords: it is fast by design, so use Argon2id or PBKDF2 for low-entropy inputs.'
});

/* ---------- Symmetric ---------- */
X('aes', {
 idea: 'AES is a block cipher: with a secret key it maps each 16-byte input block to a 16-byte output block, and without the key the mapping looks random. It runs 10, 12 or 14 rounds (for 128-, 192- or 256-bit keys), each scrambling a 4 × 4 grid of bytes.',
 steps: ['Expand the key into a separate 16-byte round key for each round.', 'XOR the first round key into the block (AddRoundKey).', 'Each round: SubBytes replaces every byte through a fixed S-box; ShiftRows rotates each row of the grid; MixColumns combines the four bytes of each column; AddRoundKey XORs in the round key.', 'The final round skips MixColumns. Decryption applies the inverse steps in reverse order.'],
 why: 'The S-box (based on inversion in the field GF(2⁸)) provides non-linearity, so the cipher can’t be described by simple equations. ShiftRows and MixColumns spread each byte’s influence across the whole block within two rounds. After 10 rounds every output bit depends on every input and key bit in a complex way. After more than 25 years of analysis, the best known attacks on full AES are barely faster than trying every key: 2¹²⁶ for AES-128.',
 cost: 'Fixed work per block. With AES-NI or ARM crypto instructions, several GB/s per core. The key schedule is computed once per key.',
 use: 'AES on its own encrypts exactly one block; real data needs a mode of operation. Use AES-GCM (or ChaCha20-Poly1305) for almost everything. Never use ECB mode, which encrypts identical blocks identically and leaks patterns (the famous “ECB penguin”). AES-256 adds margin against future quantum attacks (Grover’s algorithm halves effective key length).'
});
X('cbc', {
 idea: 'Cipher Block Chaining XORs each plaintext block with the previous ciphertext block before encrypting it. The first block is XORed with a random initialization vector (IV). As a result, identical plaintext blocks produce different ciphertext.',
 steps: ['Pad the plaintext to a multiple of 16 bytes (PKCS#7: append n bytes each of value n).', 'Generate a random, unpredictable 16-byte IV.', 'C₁ = AES(K, P₁ ⊕ IV), and Cᵢ = AES(K, Pᵢ ⊕ Cᵢ₋₁).', 'Send IV ‖ ciphertext. To decrypt: Pᵢ = AES⁻¹(K, Cᵢ) ⊕ Cᵢ₋₁, then remove and check the padding.'],
 why: 'The chaining and the random IV hide patterns: with a fresh IV, encrypting the same message twice gives unrelated ciphertexts. But CBC gives confidentiality only, not integrity. Attackers can flip bits in Cᵢ₋₁ to make chosen changes in Pᵢ, and if a server reveals whether padding was valid (a padding oracle), an attacker can decrypt everything byte by byte (the Lucky 13 and POODLE attacks).',
 cost: 'Encryption is sequential (each block needs the previous ciphertext), but decryption can run in parallel. Ciphertext grows by the IV plus up to 16 bytes of padding.',
 use: 'CBC survives in legacy protocols and file formats. If you must use it, authenticate with encrypt-then-MAC (HMAC over IV and ciphertext, verified before decrypting) and use an unpredictable IV. For new designs, prefer an AEAD mode such as AES-GCM.'
});
X('ctr', {
 idea: 'Counter mode turns a block cipher into a stream cipher. Encrypt a sequence of counter blocks (nonce followed by 0, 1, 2, …) to create a keystream, then XOR the keystream with the plaintext. Decryption is identical.',
 steps: ['Pick a unique nonce for this message.', 'For block i, compute keystream Kᵢ = AES(K, nonce ‖ i).', 'Cᵢ = Pᵢ ⊕ Kᵢ. For the final partial block, use only as many keystream bytes as needed.', 'Send nonce ‖ ciphertext. The receiver regenerates the same keystream and XORs it back.'],
 why: 'If AES behaves like a random permutation, its outputs on distinct counter blocks look like independent random bytes, so this approximates a one-time pad. That only holds if no (key, nonce, counter) value is ever reused: reusing a nonce produces the same keystream, and C₁ ⊕ C₂ = P₁ ⊕ P₂, exactly the one-time pad reuse failure. Like CBC, CTR alone offers no integrity, and flipping a ciphertext bit flips the same plaintext bit.',
 cost: 'Fully parallel for both encryption and decryption, with random access to any block. No padding: ciphertext length equals plaintext length plus the nonce.',
 use: 'CTR is the encryption half of AES-GCM and is used for disk and memory encryption, where random access matters. Use a counter or random 96-bit nonces and rotate keys long before nonces can repeat. Always add authentication, or just use GCM.'
});
X('gcm', {
 idea: 'AES-GCM is authenticated encryption with associated data (AEAD). It encrypts with CTR mode and computes a 16-byte tag over the ciphertext and optional unencrypted “associated data” (such as headers) using GHASH, a polynomial hash in the field GF(2¹²⁸). Decryption checks the tag first and refuses to return anything if it doesn’t match.',
 steps: ['Derive the hash key H = AES(K, 0¹²⁸).', 'Encrypt the plaintext with CTR mode, starting the counter at nonce ‖ 2.', 'Compute GHASH over the associated data, the ciphertext and their lengths by repeatedly XOR-ing a block in and multiplying by H.', 'Tag = GHASH result ⊕ AES(K, nonce ‖ 1). Send nonce, ciphertext and tag.', 'To decrypt, recompute the tag, compare in constant time, and only then decrypt.'],
 why: 'CTR provides confidentiality, and the GHASH tag, masked with an encrypted counter block, is a one-time MAC: forging a valid tag without the key succeeds only with negligible probability. Associated data is authenticated but not hidden. Reusing a nonce is catastrophic: besides revealing P₁ ⊕ P₂, it lets an attacker solve for H and then forge tags for any message.',
 cost: 'With AES-NI and carry-less multiply instructions, several GB/s. Overhead is a 12-byte nonce and a 16-byte tag per message. Using random nonces, limit each key to about 2³² messages.',
 use: 'GCM is the default for TLS, IPsec, SSH and most cloud encryption. Use 96-bit nonces, never repeat one under a key, and never act on plaintext before the tag is verified. Where nonce reuse is a real risk, use AES-GCM-SIV, which tolerates it.'
});
X('chacha20', {
 idea: 'ChaCha20 generates a keystream by repeatedly scrambling a 4 × 4 grid of 32-bit words containing constants, a 256-bit key, a counter and a nonce, using only additions, rotations and XORs. Poly1305 computes a one-time authentication tag from the ciphertext. Together they form an AEAD like AES-GCM.',
 steps: ['Build the 16-word state: 4 constants (“expand 32-byte k”), 8 key words, 1 counter word and 3 nonce words.', 'Apply 20 rounds (10 column rounds + 10 diagonal rounds) of the quarter-round: a += b; d ^= a; d <<<= 16; and so on.', 'Add the original state to the result; that 64-byte block is keystream. Increment the counter for the next block.', 'Encrypt by XOR. Derive a one-time Poly1305 key from block 0 and compute the tag over the associated data and ciphertext.', 'Verify the tag before decrypting.'],
 why: 'The add–rotate–XOR (ARX) rounds diffuse every input bit throughout the state; the best attacks reach only 7 of the 20 rounds. Adding the input back at the end makes the function one-way. Poly1305 with a fresh key per message is an information-theoretically secure one-time MAC. Because there are no table lookups, it runs in constant time naturally, avoiding cache-timing attacks.',
 cost: 'Fast in plain software (around 1–3 cycles per byte with SIMD), faster than AES on hardware without AES instructions. Overhead is a 12-byte nonce and a 16-byte tag.',
 use: 'It is one of the two TLS 1.3 cipher suites and is used by WireGuard, SSH (chacha20-poly1305@openssh.com) and many mobile apps. The nonce rules are the same as GCM. XChaCha20-Poly1305 uses a 192-bit nonce, so random nonces are safe even for huge numbers of messages.'
});

/* ---------- Public key ---------- */
X('rsa', {
 idea: 'RSA uses a pair of keys: a public key (n, e) that anyone can use to encrypt, and a private key d that only the owner holds to decrypt. n is the product of two secret large primes p and q. Encryption is c = mᵉ mod n and decryption is m = cᵈ mod n.',
 steps: ['Choose two large random primes p and q and compute n = p × q.', 'Compute φ(n) = (p − 1)(q − 1).', 'Pick e (usually 65537) with gcd(e, φ) = 1, and compute d = e⁻¹ mod φ with the extended Euclidean algorithm.', 'Publish (n, e); keep d, p and q secret.', 'Encrypt c = mᵉ mod n; decrypt m = cᵈ mod n using fast modular exponentiation.'],
 why: 'Correctness: ed ≡ 1 mod φ(n), so by Euler’s theorem (mᵉ)ᵈ = m^(1 + kφ) ≡ m mod n. Security: computing d requires φ(n), which requires factoring n, and the best factoring algorithms are sub-exponential but still infeasible for 2048-bit n. Textbook RSA is insecure in practice: it is deterministic (the same message always gives the same ciphertext), malleable (multiplying ciphertexts multiplies plaintexts), and small messages can be recovered directly.',
 cost: 'Key generation needs prime finding, O(k⁴) for k-bit keys. Encryption with e = 65537 is fast (17 multiplications); decryption is about O(k³) and much slower, sped up 4× using the Chinese Remainder Theorem. Ciphertext is as long as n (256 bytes for 2048-bit RSA).',
 use: 'Never use textbook RSA. Encrypt with RSA-OAEP and sign with RSA-PSS, with keys of at least 2048 bits (3072 for long-term). Shor’s algorithm would factor n on a large quantum computer, which is why migration to post-quantum schemes has begun.'
});
X('rsaoaep', {
 idea: 'OAEP (Optimal Asymmetric Encryption Padding) turns textbook RSA into a secure encryption scheme by randomizing the message before exponentiation. A random seed and a hash-based mask function scramble the message so the same plaintext never produces the same ciphertext.',
 steps: ['Build a data block: hash of an optional label, zero padding, a 0x01 byte, then the message.', 'Generate a random seed the length of the hash.', 'Mask the data block with MGF1(seed), then mask the seed with MGF1(masked data block).', 'Prepend 0x00 and encrypt the result with RSA: c = mᵉ mod n.', 'Decryption reverses the masks and checks the structure, failing in one uniform way if anything is wrong.'],
 why: 'The random seed makes encryption probabilistic, so identical messages give unrelated ciphertexts. The two masking rounds behave like a small Feistel network, so any change to the ciphertext scrambles the whole decoded block and is rejected, which removes RSA’s malleability. OAEP is provably secure against chosen-ciphertext attacks in the random oracle model, unlike the older PKCS#1 v1.5 padding, which fell to Bleichenbacher’s padding oracle attack.',
 cost: 'The same as RSA plus two cheap hash calls. Message size is limited to k − 2h − 2 bytes: 190 bytes for 2048-bit RSA with SHA-256.',
 use: 'Use it to encrypt short secrets, typically a random symmetric key (hybrid encryption), which then encrypts the real data with AES-GCM. Modern protocols generally prefer ECDH key agreement (X25519) because it is faster and has smaller keys, and TLS 1.3 dropped RSA key transport altogether.'
});
X('dh', {
 idea: 'Diffie–Hellman lets two people who have never met agree on a shared secret over a channel that everyone can see. They agree publicly on a large prime p and a generator g; each picks a private number, sends g to that power, and raises what they receive to their own private power.',
 steps: ['Publicly agree on p and g.', 'Alice picks a secret a and sends A = gᵃ mod p. Bob picks a secret b and sends B = gᵇ mod p.', 'Alice computes Bᵃ = gᵃᵇ mod p. Bob computes Aᵇ = gᵃᵇ mod p.', 'Both now hold the same secret; feed it through HKDF to derive encryption keys.'],
 why: 'An eavesdropper sees p, g, A and B. Getting the secret appears to require recovering a from A (the discrete logarithm problem), which is infeasible for well-chosen 2048-bit primes. Plain DH has no authentication: an active man-in-the-middle can run separate exchanges with each side. Real protocols sign the exchange or authenticate it with certificates.',
 cost: 'Each side does one or two modular exponentiations, O(k³) for k-bit p. Finite-field DH needs 2048–3072-bit numbers for 112–128-bit security, which is why elliptic-curve DH (256-bit keys) has mostly replaced it.',
 use: 'Use ephemeral keys (new secrets for each session, “DHE”), which gives forward secrecy: stealing a long-term key later doesn’t decrypt past sessions. Validate received values to avoid small-subgroup attacks. In new systems, use X25519.'
});
X('ecc', {
 idea: 'An elliptic curve is the set of points satisfying y² = x³ + ax + b, here with coordinates taken modulo a prime. There is a way to “add” two points to get a third. Adding a base point G to itself k times gives k × G; this is easy to compute, but going back from k × G to k is believed to be infeasible.',
 steps: ['Point addition: draw the line through P and Q; it meets the curve at a third point; reflect it across the x-axis to get P + Q. Algebraically, slope λ = (y₂ − y₁)/(x₂ − x₁), x₃ = λ² − x₁ − x₂, y₃ = λ(x₁ − x₃) − y₁ (all mod p).', 'Point doubling uses the tangent line: λ = (3x² + a)/(2y).', 'Scalar multiplication k × G uses double-and-add: scan k’s bits, doubling each time and adding G when the bit is 1.', 'A private key is a random k; the public key is the point k × G.'],
 why: 'The elliptic curve discrete logarithm problem (find k given G and k × G) has no known sub-exponential algorithm on well-chosen curves. The best attacks take about √n steps, so a 256-bit curve gives about 128-bit security, matching 3072-bit RSA. That is the reason for ECC’s small keys.',
 cost: 'Scalar multiplication is O(log k) point operations, each a few modular multiplications, and real implementations take tens of microseconds. Keys are 32 bytes compared with 256–384 bytes for RSA at similar strength.',
 use: 'Never implement curve arithmetic yourself for production: constant-time code, point validation and curve choice are subtle. Use well-reviewed curves (Curve25519, P-256) via a library. ECC is vulnerable to Shor’s algorithm too, so it is being paired with post-quantum schemes in hybrid key exchange.'
});
X('x25519', {
 idea: 'X25519 is Diffie–Hellman done on Curve25519. Each party’s private key is 32 random bytes and their public key is that number times the curve’s base point. Multiplying the other party’s public key by your private key gives a shared 32-byte secret.',
 steps: ['Generate 32 random bytes and “clamp” them (clear the low 3 bits and the top bit, set bit 254).', 'Public key = clamped scalar × base point (x = 9), using only the x-coordinate.', 'Exchange public keys.', 'Shared secret = your scalar × their public key. Reject an all-zero result.', 'Pass the secret, together with the transcript, through HKDF to derive session keys.'],
 why: 'It relies on the elliptic curve discrete log problem on a curve chosen with transparent, rigid parameters. The Montgomery ladder computes the multiplication with the same sequence of operations for every key, so timing reveals nothing. Clamping removes small-subgroup attacks, and every 32-byte string is a valid public key, so there is no point-validation step to forget.',
 cost: 'About 50–100 microseconds per operation in software; 32-byte keys and secrets.',
 use: 'This is the default key exchange in TLS 1.3, SSH, Signal, WireGuard and age. Use fresh ephemeral keys per session for forward secrecy, authenticate the exchange (with signatures or a pre-shared key), and never use the raw shared secret as a key. For post-quantum protection it is now combined with ML-KEM in hybrid schemes such as X25519MLKEM768.'
});

/* ---------- Signatures ---------- */
X('ecdsa', {
 idea: 'ECDSA lets the holder of a private key d sign a message so anyone with the public key Q = d × G can verify it. Each signature uses a fresh secret number k; the signature (r, s) ties together the message hash, k and d in a way only someone knowing d could produce.',
 steps: ['Hash the message: z = H(m).', 'Pick a secret nonce k (random, or derived deterministically with RFC 6979).', 'Compute R = k × G and r = R.x mod n.', 's = k⁻¹ (z + r · d) mod n. The signature is (r, s).', 'Verify: compute u₁ = z · s⁻¹ and u₂ = r · s⁻¹, then check that (u₁ × G + u₂ × Q).x mod n equals r.'],
 why: 'Producing a valid s for a new message requires d, and recovering d from Q is the elliptic curve discrete log problem. The nonce is the weak point: if k is ever reused for two messages, or even partially predictable, anyone can solve the equations for d. That is exactly how the PlayStation 3 signing key (constant k) and some Android Bitcoin wallets (weak random k) were broken.',
 cost: 'Signing needs one scalar multiplication, verification two. Both are fast (well under a millisecond). Signatures are 64 bytes for P-256 (often 70–72 bytes in DER encoding).',
 use: 'Used in TLS certificates, passkeys and WebAuthn (P-256), Bitcoin and Ethereum (secp256k1), and code signing. Use deterministic nonces (RFC 6979) or a well-tested library that handles them. ECDSA signatures are malleable ((r, −s) is also valid), so don’t use them as unique transaction IDs. Prefer Ed25519 for new designs where you can choose.'
});
X('ed25519', {
 idea: 'Ed25519 is a Schnorr-style signature on a twisted Edwards form of Curve25519. Unlike ECDSA, its per-signature nonce is derived deterministically by hashing the private key together with the message, so there is no random number to get wrong.',
 steps: ['From a 32-byte seed, compute SHA-512; the first half (clamped) is the secret scalar a, the second half is a nonce prefix. Public key A = a × B.', 'To sign: r = SHA-512(prefix ‖ message) mod L, R = r × B.', 'k = SHA-512(R ‖ A ‖ message) mod L; S = (r + k · a) mod L. The signature is R ‖ S (64 bytes).', 'To verify: compute k the same way and check that S × B = R + k × A.'],
 why: 'Security reduces to the elliptic curve discrete log problem. Deterministic nonces eliminate the nonce-reuse failures that broke many ECDSA systems, since the same message always gives the same r and different messages give unrelated ones. The Edwards addition formulas are complete (no special cases), which makes constant-time implementation straightforward. Including A in the hash prevents key-substitution attacks.',
 cost: 'Very fast: tens of thousands of signatures and verifications per second per core, and batch verification is faster still. 32-byte public keys and 64-byte signatures.',
 use: 'It is the default key type for SSH (ssh-keygen -t ed25519) and is used in Signal, Tor, WireGuard, many package signing systems and DNSSEC. Note that implementations differ slightly in edge-case validation, which matters for consensus systems; use a library that follows RFC 8032 and ZIP-215 conventions as required.'
});

/* ---------- Advanced ---------- */
X('lwe', {
 idea: 'Learning With Errors asks you to recover a secret vector s from many equations of the form b = ⟨a, s⟩ + e mod q, where each a is random and public, and each e is a small random error. Without the errors, Gaussian elimination solves it instantly. With them, no efficient algorithm is known, even for quantum computers.',
 steps: ['Key generation: pick a random matrix A and a secret s with small entries; publish (A, b = A·s + e).', 'Encrypt a bit: pick a small random vector r and compute u = rᵀA and v = rᵀb + bit · ⌊q/2⌋ (plus small error).', 'Decrypt: compute v − u·s = rᵀe + bit · ⌊q/2⌋ + small error. If the result is closer to q/2 than to 0, the bit was 1.', 'Real schemes (ML-KEM / Kyber) use structured “module” lattices built from polynomials, so keys are kilobytes instead of megabytes.'],
 why: 'Solving LWE is at least as hard as worst-case problems on lattices (finding short vectors) that have resisted decades of research, by both classical and quantum methods; Shor’s algorithm does not apply. The noise is small enough that decryption still works, because rᵀe stays well below q/4, but large enough to hide s.',
 cost: 'ML-KEM-768 has 1184-byte public keys and 1088-byte ciphertexts, larger than X25519’s 32 bytes, but encapsulation and decapsulation are as fast or faster than elliptic curve operations.',
 use: 'NIST standardized ML-KEM (FIPS 203) for key exchange and ML-DSA (FIPS 204) for signatures in 2024. Chrome, Cloudflare, Apple iMessage (PQ3) and Signal (PQXDH) already deploy hybrid X25519 + ML-KEM to protect today’s traffic against “harvest now, decrypt later”. The toy example here shows the idea; never use toy parameters.'
});
X('shamir', {
 idea: 'Shamir’s secret sharing hides a secret as the constant term of a random polynomial of degree k − 1. Each share is one point on the polynomial. Any k points determine the polynomial and hence the secret, while k − 1 points are consistent with every possible secret.',
 steps: ['Work modulo a prime larger than the secret.', 'Pick random coefficients a₁ … aₖ₋₁ and form f(x) = secret + a₁x + … + aₖ₋₁xᵏ⁻¹.', 'Give participant i the share (i, f(i)) for i = 1 … n.', 'To recover, take any k shares and use Lagrange interpolation at x = 0: secret = Σ yᵢ · Π (xⱼ / (xⱼ − xᵢ)) over the other j.'],
 why: 'A polynomial of degree k − 1 is uniquely determined by k points. With only k − 1 points, for every candidate secret there is exactly one polynomial through those points with that constant term, and all are equally likely because the coefficients were random. So k − 1 shares reveal literally nothing: this is information-theoretic security, independent of computing power.',
 cost: 'Creating n shares is O(n · k) multiplications; reconstruction with Lagrange interpolation is O(k²). Each share is the same size as the secret.',
 use: 'Used for splitting master keys (HashiCorp Vault unseal keys, DNSSEC root key ceremonies), wallet seed backups (SLIP-39) and threshold schemes. It does not detect cheating shares; verifiable secret sharing adds commitments for that. Generate coefficients with a CSPRNG, and recombine on a trusted machine, since the secret exists in one place at that moment.'
});
