<?php 

$servername = "sql109.epizy.com";
$username = "epiz_20709020";
$password = "eKrrswv3VU";
$database = "epiz_20709020_main";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);

// Get File name
if (!array_key_exists("url", $_GET) || 
    ($file = $conn->escape_string($_GET["url"])) =="" ||
    !array_key_exists("uuid", $_GET) ||
    ($uuid = $conn->escape_string($_GET["uuid"])) == ""){
    http_response_code(400);
    echo "Invalid URL";
    die();
}

// Add a clap record 
$datetime = time();
$ip = $_SERVER['REMOTE_ADDR'];
$sql = "INSERT INTO `claps` (`file`, `datetime`, `ip`, `uuid`) VALUES ( '$file',  $datetime , '$ip', '$uuid')";
$conn->query($sql);

// Return new count 
$sql = "SELECT COUNT(`file`) FROM `claps` WHERE `file` LIKE '$file' ";
$result = $conn->query($sql);
$claps = $result->fetch_row()[0];

$sql = "SELECT COUNT(DISTINCT `uuid`) FROM `claps` WHERE `file` LIKE '$file' ";
$result = $conn->query($sql);
$uclaps = $result->fetch_row()[0];

header('Content-Type: application/json');
echo json_encode([
    'claps' => intval($claps),
    'unique_claps' => intval($uclaps)
]);
?>
