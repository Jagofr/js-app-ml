# Generate-LocalhostCert.ps1

# --- Configuration ---
$certName = "localhost"
$daysValid = 3650 # 10 years
$keyFile = "$certName.key.pem"
$certFile = "$certName.cert.pem"
$configFile = "openssl-temp.cnf"
# ---------------------

# 1. Check for Administrator privileges
Write-Host "Checking for Administrator privileges..."
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Warning "Administrator privileges are required to import the certificate."
    Write-Host "Please re-run this script in an elevated PowerShell session (Right-click > Run as Administrator)."
    Read-Host "Press Enter to exit..."
    return
}

# 2. Check if OpenSSL is in PATH
Write-Host "Checking for OpenSSL..."
$opensslCheck = Get-Command openssl -ErrorAction SilentlyContinue
if (-not $opensslCheck) {
    Write-Error "OpenSSL not found. Please make sure openssl.exe is installed and included in your system's PATH."
    Read-Host "Press Enter to exit..."
    return
}
Write-Host "OpenSSL found at: $($opensslCheck.Source)"

# 3. Create a temporary OpenSSL configuration file (.cnf)
# This is required to add Subject Alternative Names (SAN), which modern browsers demand.
Write-Host "Creating temporary OpenSSL config file ($configFile)..."
$config = @"
[req]
distinguished_name = dn
x509_extensions = v3_req
prompt = no
[dn]
CN = $certName
[v3_req]
keyUsage = digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = $certName
DNS.2 = "www.$certName"
IP.1 = 127.0.0.1
IP.2 = ::1
"@
Set-Content -Path $configFile -Value $config -Encoding Ascii

# 4. Generate the private key and self-signed certificate
Write-Host "Generating certificate ($certFile) and private key ($keyFile)..."
$opensslArgs = "req -x509 -nodes -days $daysValid -newkey rsa:2048 -keyout $keyFile -out $certFile -config $configFile"

try {
    Start-Process openssl -ArgumentList $opensslArgs -Wait -NoNewWindow
    Write-Host "Certificate and key generated successfully."
}
catch {
    Write-Error "OpenSSL command failed. See error details: $_"
    Remove-Item $configFile -ErrorAction SilentlyContinue
    Read-Host "Press Enter to exit..."
    return
}

# 5. Import the certificate to the Windows Trusted Root store
Write-Host "Importing certificate to 'Local Machine\Trusted Root Certification Authorities'..."
try {
    Import-Certificate -FilePath $certFile -CertStoreLocation Cert:\LocalMachine\Root -ErrorAction Stop
    Write-Host -ForegroundColor Green "SUCCESS: Certificate imported and trusted."
}
catch {
    Write-Error "Failed to import certificate. Details: $_"
}

# 6. Clean up the temporary config file
Write-Host "Cleaning up temporary file..."
Remove-Item $configFile -ErrorAction SilentlyContinue

Write-Host "Process complete."
Read-Host "Press Enter to exit..."