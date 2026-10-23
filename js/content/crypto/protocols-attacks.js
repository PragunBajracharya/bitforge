/* ===== Cryptography: protocols (TLS 1.3, PKI) and attacks ===== */
SD_CATS.push(['crproto', 'Protocols & PKI'], ['crattack', 'Attacks']);
const CRT = (k, o) => { o.domain = 'Cryptography'; SDX(k, o); };

CRT('tls13', { name: 'TLS 1.3 handshake', cat: 'crproto',
  blurb: `TLS is how every HTTPS connection gets confidentiality, integrity and server authentication. TLS 1.3 (2018) puts together everything earlier units built: an ephemeral X25519 key exchange, HKDF key derivation, AEAD encryption with AES-GCM or ChaCha20-Poly1305, and a signature that proves the server owns its certificate, all in one round trip.`,
  facts: [['Round trips', '1 (0 on resume)'], ['Key exchange', '(EC)DHE only'], ['Ciphers', '5 AEAD suites'], ['Forward secrecy', 'always']],
  dg: { w: 840, h: 330,
    n: [['c', 'Browser', 110, 150, 'client'], ['s', 'Server', 730, 150, 'svc', 'cert + private key'], ['ca', 'Trust store', 110, 285, 'box', 'root CAs']],
    e: [['c', 's', 'ClientHello + key share', 'U', 'm1'], ['s', 'c', 'ServerHello + key share', 'n', 'm2'], ['s', 'c', '{Certificate, CertificateVerify, Finished}', '', 'm3'], ['c', 's', '{Finished} + HTTP request', 'n', 'm4'], ['s', 'c', 'HTTP response', 'U', 'm5'], ['ca', 'c', 'verify chain', 'd', 'm6']] },
  cap: `One round trip: the client guesses the key-exchange group and sends its share up front. Everything after ServerHello (shown in braces) is already encrypted.`,
  walk: [[['c', 's', 'm1'], `<b>ClientHello:</b> supported cipher suites, a random nonce, the server name (SNI), ALPN (h2, http/1.1) and, crucially, an X25519 public key share, guessing the server will accept it.`],
    [['s', 'c', 'm2'], `<b>ServerHello:</b> the chosen suite (say TLS_AES_128_GCM_SHA256) and the server’s own X25519 share. Both sides now compute the same shared secret and run it through the HKDF key schedule to get handshake keys.`],
    [['s', 'c', 'm3'], `<b>Encrypted flight:</b> EncryptedExtensions, the certificate chain, CertificateVerify (a signature over the whole handshake transcript with the certificate’s private key) and Finished (an HMAC over the transcript).`],
    [['ca', 'c', 'm6'], `The browser validates the chain up to a root in its trust store, checks the hostname and validity dates, and verifies the CertificateVerify signature. This proves the server holds the key; a man-in-the-middle can’t produce it.`],
    [['c', 's', 'm4'], `The client sends its own Finished and, in the same flight, the first HTTP request encrypted with application keys. The handshake cost exactly one round trip.`],
    [['s', 'c', 'm5'], `Application data flows in AEAD-protected records. Each record has a sequence number used in the nonce, so records can’t be reordered or replayed.`]],
  sections: [
    ['What changed from TLS 1.2', TBL(['', 'TLS 1.2', 'TLS 1.3'], [['Round trips', '2', '1 (0-RTT on resumption)'], ['Key exchange', 'RSA key transport or (EC)DHE', '(EC)DHE only, so forward secrecy is mandatory'], ['Ciphers', 'Many, including CBC and RC4', 'Only AEADs: AES-GCM, ChaCha20-Poly1305, AES-CCM'], ['Encrypted', 'Certificate sent in clear', 'Everything after ServerHello'], ['Negotiation', 'Complex, downgrade-prone', 'Simplified; downgrade protection in ServerHello.random']])],
    ['The key schedule', PP(`TLS 1.3 derives every key with HKDF (from the key derivation unit). The ECDHE shared secret goes into HKDF-Extract; HKDF-Expand-Label with labels like “c hs traffic” and “s ap traffic” and a hash of the transcript produces separate keys and IVs for each direction and phase. Binding keys to the transcript means any tampering with handshake messages produces different keys and the Finished check fails.`)],
    ['Session resumption and 0-RTT', UL([`After a handshake the server issues a session ticket (a pre-shared key). Next time the client can resume with it plus a fresh key share, skipping certificate checks.`, `With 0-RTT the client sends application data in its very first flight, encrypted with keys from the PSK. Trade-off: 0-RTT data can be replayed by an attacker, so it must only carry idempotent requests (GET), and servers often limit it.`])],
    ['Certificates and authentication', PP(`The server proves its identity with a certificate chain issued by a certificate authority (see the PKI topic) and a signature (ECDSA P-256, RSA-PSS or Ed25519) over the handshake transcript. Clients are usually anonymous; mutual TLS (mTLS) adds a client certificate, common between services.`)],
    ['Hybrid post-quantum key exchange', PP(`Since 2024, Chrome, Firefox and Cloudflare negotiate X25519MLKEM768 by default: the key share contains both an X25519 key and an ML-KEM-768 encapsulation key, and the secret combines both, so traffic recorded today stays safe even if quantum computers later break X25519.`)]
  ],
  snips: [['openssl', 'bash', `# Watch a real TLS 1.3 handshake
openssl s_client -connect example.com:443 -tls1_3 -servername example.com </dev/null
# Look for: "Protocol  : TLSv1.3", "Cipher    : TLS_AES_256_GCM_SHA384",
# "Server Temp Key: X25519", and the certificate chain

# Show only the certificate details
openssl s_client -connect example.com:443 </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates`],
    ['Python', 'python', `import socket, ssl

ctx = ssl.create_default_context()            # verifies chain + hostname
ctx.minimum_version = ssl.TLSVersion.TLSv1_3
with socket.create_connection(("example.com", 443)) as sock:
    with ctx.wrap_socket(sock, server_hostname="example.com") as tls:
        print(tls.version())                  # TLSv1.3
        print(tls.cipher())                   # ('TLS_AES_256_GCM_SHA384', 'TLSv1.3', 256)
        print(tls.getpeercert()["subject"])`],
    ['Node.js', 'javascript', `import tls from "node:tls";

const socket = tls.connect({ host: "example.com", port: 443, servername: "example.com", minVersion: "TLSv1.3" }, () => {
  console.log(socket.getProtocol());       // TLSv1.3
  console.log(socket.getCipher().name);    // TLS_AES_256_GCM_SHA384
  console.log(socket.authorized);          // true when the chain verified
  socket.end();
});`]],
  edge: [`Never disable certificate verification (verify=False, rejectUnauthorized: false) to “fix” an error; it removes all protection against interception.`, `0-RTT data is replayable: only allow it for idempotent requests.`, `SNI is sent in clear in ClientHello; Encrypted Client Hello (ECH) fixes this where supported.`, `Middleboxes that break on unknown versions are why TLS 1.3 pretends to be TLS 1.2 on the wire (version in supported_versions extension).`],
  faq: [['Why is TLS 1.3 faster than TLS 1.2?', PP(`The client sends its key share in the first message, guessing the group, so keys are agreed after one round trip instead of two. Resumption with 0-RTT can send data immediately.`)],
    ['What gives TLS forward secrecy?', PP(`Ephemeral (EC)DHE keys generated per connection and then deleted. Stealing the server’s certificate key later doesn’t reveal past session keys, because that key only signs; it never encrypts the session secret.`)],
    ['What does CertificateVerify prove?', PP(`That the server holds the private key matching its certificate, because it signs a hash of the whole handshake transcript, which includes both random nonces and key shares. A replayed certificate without the key can’t produce it.`)]],
  qs: [SQ('How many round trips does a full TLS 1.3 handshake need before application data?', ['0', '1', '2', '3'], 1, 'Key shares travel in the first flight, so the client can send data after one round trip.'),
    SQ('Which key exchange does TLS 1.3 remove?', ['X25519', 'Static RSA key transport', 'ECDHE with P-256', 'Finite-field DHE'], 1, 'RSA key transport had no forward secrecy and enabled Bleichenbacher-style attacks.'),
    SQ('Why is 0-RTT data restricted to idempotent requests?', ['It is unencrypted', 'An attacker can replay it', 'It is slower', 'It skips the certificate'], 1, '0-RTT data has no fresh server input, so replays can’t be detected in general.')]
});
DP('tls13', { work: ['Every HTTPS site, API and service mesh (mTLS); debugging certificate and handshake errors.'],
  fu: [['How does TLS prevent a downgrade to TLS 1.2?', 'The transcript hash covers all negotiation, and a TLS 1.3 server that negotiates 1.2 puts a special sentinel in the last bytes of ServerHello.random, which 1.3-capable clients check.'],
    ['What happens if the server doesn’t support the client’s guessed key share group?', 'It sends HelloRetryRequest naming a supported group, and the client retries with that share, costing one extra round trip.'],
    ['What is mutual TLS and where is it used?', 'The server also requests a client certificate and verifies it. Service meshes (Istio, Linkerd) use mTLS with short-lived workload certificates so every service call is authenticated and encrypted.'],
    ['What does Encrypted Client Hello protect?', 'It encrypts the inner ClientHello, including SNI, with the server’s published HPKE key (from DNS), hiding which site you’re visiting from on-path observers.']],
  deep: [['Edge case', 'Clock skew on clients makes valid certificates appear expired or not yet valid.'],
    ['Failure mode', 'Heartbleed (2014) was an OpenSSL bug in the heartbeat extension that leaked server memory, including private keys; implementation bugs matter as much as protocol design.'],
    ['In real systems', 'Cloudflare and Google terminate TLS at the edge; BoringSSL, OpenSSL, rustls and Go’s crypto/tls implement TLS 1.3.']],
  src: ['RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3', 'https://www.rfc-editor.org/rfc/rfc8446'] });

CRT('pki', { name: 'Certificates & PKI', cat: 'crproto',
  blurb: `A public key is only useful if you know whose it is. Public key infrastructure (PKI) answers that with certificates: signed statements by certificate authorities binding a public key to a name. Browsers trust a few root CAs, roots sign intermediates, and intermediates sign the certificates servers present.`,
  facts: [['Format', 'X.509 v3'], ['Chain', 'leaf → intermediate → root'], ['Max lifetime', '398 days (shrinking)'], ['Free issuance', 'ACME / Let’s Encrypt']],
  dg: { w: 880, h: 380,
    n: [['root', 'Root CA', 120, 80, 'box', 'offline · in trust stores'], ['inter', 'Intermediate CA', 370, 80, 'box', 'signs leaf certificates'], ['leaf', 'Leaf certificate', 620, 80, 'box', 'CN=example.com'],
      ['srv', 'Web server', 620, 270, 'svc', 'sends leaf + intermediate'], ['br', 'Browser', 290, 290, 'client'], ['ct', 'CT logs', 820, 190, 'db', 'public, append-only']],
    e: [['root', 'inter', 'signs'], ['inter', 'leaf', 'signs'], ['leaf', 'srv', 'installed'], ['srv', 'br', 'chain in TLS'], ['br', 'root', 'trust anchor', 'd'], ['inter', 'ct', 'logged', 'd']] },
  cap: `The browser builds a path from the server’s leaf certificate through the intermediate to a root it already trusts, checking each signature, the hostname, dates, revocation and Certificate Transparency proofs.`,
  walk: [[['root'], `A root CA’s self-signed certificate ships in operating system and browser trust stores. Its key is kept offline in hardware security modules and used rarely.`],
    [['root', 'inter', 'root>inter'], `The root signs an intermediate CA certificate. Day-to-day issuance uses the intermediate, so a compromise can be contained by revoking it without replacing the root everywhere.`],
    [['inter', 'leaf', 'inter>leaf'], `A site proves control of example.com (ACME HTTP-01 or DNS-01 challenge) and gets a leaf certificate: its public key, names (Subject Alternative Names), validity dates, and the intermediate’s signature.`],
    [['inter', 'ct', 'inter>ct'], `Before issuing, the CA submits the certificate to public Certificate Transparency logs and embeds the signed receipts (SCTs). Browsers require them, so mis-issued certificates become visible.`],
    [['leaf', 'srv', 'srv', 'srv>br', 'leaf>srv'], `The server sends its leaf and intermediate in the TLS handshake.`],
    [['br', 'root', 'br>root'], `The browser chains up to a trusted root, verifies each signature, checks that the hostname matches a SAN, that dates are valid, and revocation status, then trusts the key for the CertificateVerify signature.`]],
  sections: [
    ['What is in a certificate', TBL(['Field', 'Example', 'Purpose'], [['Subject / SAN', 'DNS:example.com, DNS:www.example.com', 'Names the key is valid for (SAN is what browsers check)'], ['Public key', 'EC P-256 or RSA-2048', 'The key being certified'], ['Issuer', 'CN=R11, O=Let’s Encrypt', 'Who signed it'], ['Validity', 'notBefore / notAfter', 'Lifetime, now ≤ 398 days, moving to 47 days by 2029'], ['Extensions', 'Key usage, basic constraints (CA:FALSE)', 'What the key may do; whether it can sign other certificates'], ['Signature', 'ecdsa-with-SHA256', 'Issuer’s signature over everything above']])],
    ['Getting a certificate with ACME', OL([`Your ACME client (certbot, Caddy, cert-manager) creates a key pair and an account with the CA.`, `It requests a certificate for your domains and receives challenges.`, `It proves control: serve a token at http://domain/.well-known/acme-challenge/ (HTTP-01) or publish a TXT record (DNS-01, needed for wildcards).`, `It sends a certificate signing request (CSR); the CA issues the certificate, and the client installs and auto-renews it.`])],
    ['Revocation', UL([`<b>CRLs:</b> CAs publish lists of revoked serial numbers; large and slow to update.`, `<b>OCSP:</b> clients ask the CA if a certificate is revoked; privacy and availability issues, so browsers mostly don’t do it live. Let’s Encrypt ended OCSP support in 2025.`, `<b>OCSP stapling</b> lets the server attach a recent signed status.`, `In practice, short-lived certificates are the main defense: a stolen key is only useful until expiry.`])],
    ['Internal PKI', PP(`Companies run private CAs for service-to-service mTLS, VPNs and devices, issuing very short-lived certificates (hours) automatically through tools like cert-manager, HashiCorp Vault PKI, SPIFFE/SPIRE or AWS Private CA. Private roots must be distributed to every client that needs to trust them.`)]
  ],
  snips: [['openssl', 'bash', `# Create a key and a certificate signing request
openssl ecparam -genkey -name prime256v1 -out site.key
openssl req -new -key site.key -subj "/CN=example.com" \\
  -addext "subjectAltName=DNS:example.com,DNS:www.example.com" -out site.csr

# Inspect a certificate
openssl x509 -in cert.pem -noout -text | less

# Verify a chain against a root
openssl verify -CAfile root.pem -untrusted intermediate.pem leaf.pem`],
    ['certbot', 'bash', `# Get and auto-install a Let's Encrypt certificate for nginx
sudo certbot --nginx -d example.com -d www.example.com
# Renewal runs from a systemd timer; test it with:
sudo certbot renew --dry-run`],
    ['Python (verify)', 'python', `from cryptography import x509
from cryptography.hazmat.primitives.asymmetric import ec

leaf = x509.load_pem_x509_certificate(open("leaf.pem", "rb").read())
inter = x509.load_pem_x509_certificate(open("intermediate.pem", "rb").read())

print(leaf.subject, leaf.not_valid_after_utc)
print(leaf.extensions.get_extension_for_class(x509.SubjectAlternativeName).value)
# check the intermediate signed the leaf (EC example)
inter.public_key().verify(leaf.signature, leaf.tbs_certificate_bytes,
                          ec.ECDSA(leaf.signature_hash_algorithm))
print("signature OK")`]],
  edge: [`Servers that forget to send the intermediate work in some browsers (which cache or fetch it) and fail in others and in API clients.`, `Wildcard *.example.com does not match example.com itself or a.b.example.com.`, `Certificate pinning in mobile apps breaks when certificates rotate; pin the CA or a backup key, or avoid pinning.`, `Expired certificates are a leading cause of outages; automate renewal and alert on expiry.`],
  faq: [['Why do CAs use intermediates instead of signing with the root?', PP(`The root key stays offline, reducing the chance of compromise, and a compromised intermediate can be revoked without replacing the root in billions of devices.`)],
    ['What is Certificate Transparency?', PP(`Public append-only logs (Merkle trees) of every issued certificate. Browsers require proof of logging, so domain owners can monitor for certificates issued for their domains without permission.`)],
    ['How does a browser decide the name matches?', PP(`It compares the hostname against the Subject Alternative Name entries (the Common Name is ignored by modern browsers), with wildcard rules limited to one label.`)]],
  qs: [SQ('What does a certificate authority’s signature on a certificate assert?', ['The server is safe', 'The public key belongs to the named domain (after validation)', 'The website is a real company', 'The connection is encrypted'], 1, 'Domain-validated certificates only bind a key to a name.'),
    SQ('Why are short certificate lifetimes useful?', ['They are cheaper', 'Revocation is unreliable, so a stolen key stops working soon anyway', 'Browsers require yearly payment', 'They are faster to verify'], 1, 'Short lifetimes limit the damage of key compromise without depending on revocation checks.')]
});
DP('pki', { work: ['TLS for websites, internal mTLS, code signing, S/MIME email and device identity.'],
  fu: [['How would you rotate certificates for 5,000 internal services?', 'Automate: a private CA issues short-lived certificates (hours) via cert-manager or SPIRE; sidecars or libraries reload them without restarts; monitor issuance and expiry.'],
    ['What happens when a CA misbehaves?', 'Browsers distrust it, as with DigiNotar (2011, compromised) and Symantec (2018, mis-issuance); sites had to replace certificates.'],
    ['DV vs OV vs EV certificates?', 'Domain-validated proves control of the domain; organization and extended validation add company checks. Browsers no longer show EV specially, so DV with automation is the norm.']],
  deep: [['Edge case', 'Name constraints let a private intermediate issue only for *.corp.example.'],
    ['Failure mode', 'Let’s Encrypt’s old root expiry in 2021 broke older devices that lacked the new root.'],
    ['In real systems', 'Let’s Encrypt issues the majority of web certificates via ACME; Chrome Root Program and Mozilla’s CA policy govern trusted roots.']],
  src: ['RFC 5280: Internet X.509 PKI Certificate and CRL profile', 'https://www.rfc-editor.org/rfc/rfc5280'] });

CRT('crypto-attacks', { name: 'Attacks on real cryptography', cat: 'crattack',
  blurb: `Strong algorithms are rarely broken; systems are broken by how they use them. This lesson collects the attacks that actually happen: ECB patterns, nonce reuse, padding oracles, timing leaks, birthday collisions, weak randomness and downgrade attacks. The lab lets you run four of them.`,
  facts: [['Most common cause', 'misuse, not math'], ['Nonce reuse', 'breaks GCM and CTR'], ['Birthday bound', '2^(n/2)'], ['Defense', 'use high-level APIs']],
  sections: [
    ['ECB mode leaks patterns', PP(`ECB encrypts each 16-byte block independently with the same key, so identical plaintext blocks give identical ciphertext blocks. Images keep their outlines; structured records reveal repeated fields. Any mode with an IV or nonce (CBC, CTR, GCM) hides this.`) + CO('Fix:', 'use an AEAD (AES-GCM, ChaCha20-Poly1305) through a library API that picks the mode for you.')],
    ['Nonce reuse in stream modes', PP(`CTR, GCM and ChaCha20 XOR the plaintext with a key stream derived from (key, nonce). Reusing the pair means c₁ ⊕ c₂ = p₁ ⊕ p₂: knowing or guessing one message reveals the other. With GCM it also leaks the authentication key, enabling forgeries.`) + CO('Fix:', 'counters or 96-bit random nonces under the 2³² limit, key rotation, or misuse-resistant modes (AES-GCM-SIV, XChaCha20).')],
    ['Padding oracles', PP(`If a server decrypts CBC data and reveals whether the padding was valid (different error, different timing), an attacker can decrypt messages byte by byte by modifying the previous block. Bleichenbacher’s attack is the RSA PKCS#1 v1.5 equivalent.`) + CO('Fix:', 'authenticate before decrypting (encrypt-then-MAC or AEAD) and return one generic error.')],
    ['Timing side channels', PP(`Comparing a MAC with == stops at the first different byte, so response time reveals how many leading bytes are right, letting an attacker guess the tag one byte at a time. Table-based AES and variable-time big-number code leak keys through caches and timing.`) + CO('Fix:', 'constant-time comparison (hmac.compare_digest, crypto.timingSafeEqual) and constant-time crypto libraries.')],
    ['Birthday collisions', PP(`With an n-bit hash, a collision is expected after about 2^(n/2) random inputs, not 2ⁿ: 64-bit hashes collide after ~4 billion values, and 32-bit tags after ~65,000. This is why hashes need 256 bits and why 64-bit block ciphers fail after ~32 GB of data (Sweet32).`)],
    ['Weak randomness and downgrades', UL([`Predictable keys or nonces from non-cryptographic RNGs or bad seeding (the Debian OpenSSL bug, PS3 ECDSA nonce reuse).`, `Downgrade attacks trick parties into weaker options (FREAK, Logjam, POODLE); TLS 1.3 binds negotiation into the transcript to prevent them.`, `Length extension on H(secret ‖ message) MACs; use HMAC.`])],
    ['A misuse checklist', OL([`Use a vetted library’s high-level API (libsodium, Tink, Web Crypto) rather than assembling primitives.`, `Never invent a cipher, mode or protocol.`, `Authenticate everything you decrypt.`, `Unique nonces per key; random keys from a CSPRNG.`, `Constant-time comparisons for secrets.`, `Slow, salted hashes for passwords.`, `Plan key rotation and algorithm agility.`])]
  ],
  edge: [`Compressing secrets alongside attacker-controlled data before encryption leaks them through ciphertext length (CRIME, BREACH).`, `Error messages and logs can become oracles; keep crypto failures uniform.`, `“Encrypted” does not mean “authenticated”: CTR and CBC without a MAC are malleable.`],
  faq: [['Why is “encrypt then MAC” preferred over “MAC then encrypt”?', PP(`The receiver checks the MAC before decrypting, so tampered ciphertext is rejected without ever reaching padding or parsing code that could leak information.`)],
    ['Is a 128-bit random nonce safe for AES-GCM?', PP(`GCM nonces are 96 bits. With random 96-bit nonces, NIST limits a key to 2³² messages so the collision probability stays below 2⁻³². Beyond that, rotate keys or use XChaCha20-Poly1305 with 192-bit nonces.`)],
    ['How do you find crypto misuse in a codebase?', PP(`Search for ECB, static IVs, Math.random or random.random for secrets, == on MACs, MD5/SHA-1 for passwords, disabled certificate checks; use linters (Semgrep rules, Bandit) and prefer reviewed wrappers.`)]],
  qs: [SQ('Two messages were encrypted with AES-CTR using the same key and nonce. What can an attacker compute without the key?', ['Nothing', 'p₁ ⊕ p₂', 'The key', 'The nonce'], 1, 'The key stream cancels: c₁ ⊕ c₂ = p₁ ⊕ p₂.'),
    SQ('About how many random inputs until a 64-bit hash collides?', ['64', '2³²', '2⁶³', '2⁶⁴'], 1, 'Birthday bound: about 2^(n/2).'),
    SQ('Why compare MACs with a constant-time function?', ['It is faster', 'Early-exit comparison leaks how many bytes match through timing', 'It handles Unicode', 'It encrypts the MAC'], 1, 'Timing differences let attackers guess the tag byte by byte.')]
});
DP('crypto-attacks', { work: ['Security reviews, penetration tests and code review of anything that touches keys.'],
  fu: [['How would you explain the ECB penguin to a non-expert?', 'The same input block always becomes the same output block, so regions of the same color stay the same “encrypted color” and the outline survives.'],
    ['How do you safely encrypt billions of records with one key?', 'Don’t: use envelope encryption with a data key per record or per batch (KMS), or a deterministic nonce scheme like counters per key, or AES-GCM-SIV.'],
    ['What is a chosen-ciphertext attack and which designs resist it?', 'The attacker submits modified ciphertexts and learns from responses (padding oracles). AEADs and RSA-OAEP are designed to be CCA-secure.']],
  deep: [['Edge case', 'Deterministic encryption (same plaintext → same ciphertext) is sometimes intentional for searchable fields, and it leaks equality.'],
    ['Failure mode', 'Rolling your own “simple” protocol, e.g. encrypting tokens with AES-CBC and no MAC, invites padding oracle and bit-flipping attacks.'],
    ['In real systems', 'The Cryptopals challenges teach these attacks hands-on; Google Tink’s APIs are designed to make them hard to commit.']],
  src: ['Ferguson, Schneier & Kohno, Cryptography Engineering (Wiley, 2010); Cryptopals challenges', 'https://cryptopals.com/'] });

/* ---------- Attacks lab ---------- */
const crLabs = [
{ id: 'cr-attacks', title: 'Crypto attacks lab', lede: 'Run four real attacks in your browser with Web Crypto: see what ECB leaves behind in an image, recover a message after nonce reuse, find a birthday collision, and extract a secret tag from an early-exit comparison.',
  render(root) {
    root.innerHTML = `<div class="stack" style="gap:16px">
      <div class="card"><h3>1 · ECB vs CBC on an image</h3><p class="section-sub" style="margin:4px 0 10px">The same picture encrypted with AES-128 in ECB mode (each 16-byte block alone) and in CBC mode (chained, random IV). Same key, same data.</p>
        <div class="row" style="gap:16px;align-items:flex-start;flex-wrap:wrap" id="ecbrow"><figure class="labfig"><canvas id="im0" width="96" height="96"></canvas><figcaption>Plaintext</figcaption></figure><figure class="labfig"><canvas id="im1" width="96" height="96"></canvas><figcaption>AES-ECB</figcaption></figure><figure class="labfig"><canvas id="im2" width="96" height="96"></canvas><figcaption>AES-CBC</figcaption></figure></div>
        <div class="row"><button class="btn" id="ecbgo">Encrypt with a new key</button></div></div>
      <div class="card"><h3>2 · Nonce reuse in AES-CTR</h3><p class="section-sub" style="margin:4px 0 10px">Both messages are encrypted with the same key and nonce. The attacker sees only the ciphertexts and guesses message 1 (a predictable header). Edit message 2.</p>
        <div class="lab-grid"><label><span>Message 1 (known to attacker)</span><input id="nr1" value="Transfer approved for account"></label><label><span>Message 2 (secret)</span><input id="nr2" value="PIN is 4821, do not share it"></label></div>
        <div class="tblwrap"><table class="sampletbl"><tbody><tr><th>c₁ (hex)</th><td class="mono" id="nrc1"></td></tr><tr><th>c₂ (hex)</th><td class="mono" id="nrc2"></td></tr><tr><th>c₁ ⊕ c₂</th><td class="mono" id="nrx"></td></tr><tr><th>Recovered p₂ = c₁ ⊕ c₂ ⊕ p₁</th><td id="nrr" style="font-weight:600"></td></tr></tbody></table></div></div>
      <div class="card"><h3>3 · Birthday collision</h3><p class="section-sub" style="margin:4px 0 10px">Truncate SHA-256 to n bits and hash random strings until two collide. Compare the attempts with 2^(n/2).</p>
        <div class="row"><label style="display:flex;gap:8px;align-items:center"><span>n = <b id="bdn">24</b> bits</span><input type="range" id="bdr" min="16" max="32" step="2" value="24"></label><button class="btn primary" id="bdgo">Find a collision</button></div>
        <div id="bdout" class="section-sub"></div></div>
      <div class="card"><h3>4 · Timing attack on an early-exit compare</h3><p class="section-sub" style="margin:4px 0 10px">A server checks a 6-character hex tag. Each matching byte takes one extra time unit before the first mismatch. The attacker tries all 16 values per position and keeps the slowest. (Time is simulated so results are deterministic.)</p>
        <div class="row"><button class="btn primary" id="tmgo">Run attack (early exit)</button><button class="btn" id="tmct">Run attack (constant time)</button></div>
        <div id="tmout" class="tblwrap"></div></div></div>`;
    const hex = b => [...b].map(x => x.toString(16).padStart(2, '0')).join('');
    const subtle = window.crypto && crypto.subtle;
    /* 1. image */
    const W = 96, H = 96;
    const c0 = $('#im0', root).getContext('2d');
    c0.fillStyle = '#f2efe6'; c0.fillRect(0, 0, W, H);
    c0.fillStyle = '#1c6b74'; c0.beginPath(); c0.arc(36, 40, 22, 0, Math.PI * 2); c0.fill();
    c0.fillStyle = '#b05f17'; c0.fillRect(56, 18, 28, 60);
    c0.fillStyle = '#132030'; c0.fillRect(12, 72, 72, 12);
    const plain = c0.getImageData(0, 0, W, H).data;
    const paint = (id, bytes) => { const ctx = $(id, root).getContext('2d'); const img = ctx.createImageData(W, H); for (let i = 0; i < img.data.length; i += 4) { img.data[i] = bytes[i]; img.data[i + 1] = bytes[i + 1]; img.data[i + 2] = bytes[i + 2]; img.data[i + 3] = 255; } ctx.putImageData(img, 0, 0); };
    const ecb = async () => {
      if (!subtle) { $('#ecbrow', root).insertAdjacentHTML('afterend', '<p class="section-sub">Web Crypto is not available in this browser context.</p>'); return; }
      const key = await subtle.generateKey({ name: 'AES-CBC', length: 128 }, false, ['encrypt']);
      const zero = new Uint8Array(16), n = plain.length / 16;
      const out = new Uint8Array(plain.length), cache = new Map();
      for (let b = 0; b < n; b++) {          // ECB = CBC with a zero IV on one block at a time
        const blk = plain.slice(b * 16, b * 16 + 16), k = hex(blk);
        let ct = cache.get(k);
        if (!ct) { ct = new Uint8Array(await subtle.encrypt({ name: 'AES-CBC', iv: zero }, key, blk)).slice(0, 16); cache.set(k, ct); }
        out.set(ct, b * 16);
      }
      paint('#im1', out);
      const iv = crypto.getRandomValues(new Uint8Array(16));
      paint('#im2', new Uint8Array(await subtle.encrypt({ name: 'AES-CBC', iv }, key, plain)));
    };
    $('#ecbgo', root).onclick = ecb; ecb();
    /* 2. nonce reuse */
    let ctrKey = null;
    const nonce = new Uint8Array(16);
    const nr = async () => {
      if (!subtle) return;
      if (!ctrKey) ctrKey = await subtle.generateKey({ name: 'AES-CTR', length: 128 }, false, ['encrypt']);
      const te = new TextEncoder(), p1 = te.encode($('#nr1', root).value), p2 = te.encode($('#nr2', root).value);
      const enc = async p => new Uint8Array(await subtle.encrypt({ name: 'AES-CTR', counter: nonce, length: 64 }, ctrKey, p));
      const c1 = await enc(p1), c2 = await enc(p2), m = Math.min(c1.length, c2.length);
      const x = c1.slice(0, m).map((v, i) => v ^ c2[i]);
      const rec = x.map((v, i) => v ^ (p1[i] || 0));
      $('#nrc1', root).textContent = hex(c1); $('#nrc2', root).textContent = hex(c2); $('#nrx', root).textContent = hex(x);
      $('#nrr', root).textContent = new TextDecoder().decode(rec) + (c2.length > m ? ' …(attacker needs a longer known message for the rest)' : '');
    };
    $('#nr1', root).oninput = nr; $('#nr2', root).oninput = nr; nr();
    /* 3. birthday */
    $('#bdr', root).oninput = () => { $('#bdn', root).textContent = $('#bdr', root).value; };
    $('#bdgo', root).onclick = async () => {
      if (!subtle) return;
      const n = +$('#bdr', root).value, seen = new Map(), te = new TextEncoder();
      $('#bdout', root).textContent = 'Hashing…';
      let tries = 0;
      while (true) {
        const s = 'msg-' + Math.random().toString(36).slice(2, 10);
        const h = new Uint8Array(await subtle.digest('SHA-256', te.encode(s)));
        const v = ((h[0] << 24) | (h[1] << 16) | (h[2] << 8) | h[3]) >>> (32 - n);
        tries++;
        if (seen.has(v) && seen.get(v) !== s) { $('#bdout', root).innerHTML = `Collision after <b>${tries.toLocaleString()}</b> hashes: “${seen.get(v)}” and “${s}” share the same ${n}-bit prefix <span class="mono">${v.toString(16)}</span>. 2^(n/2) = ${Math.round(2 ** (n / 2)).toLocaleString()}; brute-forcing a specific value would take about 2ⁿ = ${(2 ** n).toLocaleString()}.`; break; }
        seen.set(v, s);
        if (tries % 2000 === 0) await new Promise(r => setTimeout(r));
      }
    };
    /* 4. timing */
    const secret = hex(crypto.getRandomValues(new Uint8Array(3)));
    const early = g => { let t = 0; for (let i = 0; i < secret.length; i++) { if (g[i] !== secret[i]) return t; t++; } return t; };
    const flat = () => secret.length;
    const attack = cmp => {
      let known = '', rows = [];
      for (let pos = 0; pos < secret.length; pos++) {
        let best = '0', bt = -1, times = [];
        for (const ch of '0123456789abcdef') { const g = (known + ch).padEnd(secret.length, 'x'); const t = cmp(g); times.push(t); if (t > bt) { bt = t; best = ch; } }
        known += best; rows.push([pos + 1, best, Math.min(...times) + '–' + Math.max(...times)]);
      }
      return { known, rows };
    };
    const show = (cmp, label) => {
      const { known, rows } = attack(cmp);
      $('#tmout', root).innerHTML = RT(['Position', 'Best guess', 'Time range over 16 guesses'], rows) + `<p class="section-sub" style="margin-top:8px">${label}: recovered <b class="mono">${known}</b>; actual secret <b class="mono">${secret}</b> → ${known === secret ? '<b style="color:var(--bad)">secret extracted in 96 guesses instead of 16 million</b>' : '<b style="color:var(--good)">attack failed: every guess takes the same time</b>'}.</p>`;
    };
    $('#tmgo', root).onclick = () => show(early, 'Early-exit compare');
    $('#tmct', root).onclick = () => show(flat, 'Constant-time compare');
  } }
];
