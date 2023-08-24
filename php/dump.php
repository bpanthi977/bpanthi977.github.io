<?php 

if ($_GET['access_key'] != "eHXcKZSlPNtqvnHTPuubwZfpaeMgiTXapYkpNYGOURWhUr") {
    http_response_code(403);
    echo "Invalid Access Key!";
    die();
}

$servername = "sql109.epizy.com";
$username = "epiz_20709020";
$password = "eKrrswv3VU";
$database = "epiz_20709020_main";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

$sql = "SELECT * FROM `access_records`";
$result = $conn->query($sql);
$access_records = $result->fetch_all();

$sql = "SELECT * FROM `claps`";
$result = $conn->query($sql);
$claps = $result->fetch_all();    

header('Content-Type: application/json');
echo json_encode([
    'access_records' => $access_records,
    'claps' => $claps
]);

?>
