<?php 

$servername = "sql109.epizy.com";
$username = "epiz_20709020";
$password = "eKrrswv3VU";
$database = "epiz_20709020_main";

// Create connection
$conn = new mysqli($servername, $username, $password, $database);


if (!array_key_exists("url", $_GET) || 
    ($file = $conn->escape_string($_GET["url"])) =="" ||
    !array_key_exists("uuid", $_GET) ||
    ($uuid = $conn->escape_string($_GET["uuid"])) == ""){
    http_response_code(400);
    echo "Invalid URL or UUID";
    die();
}

$datetime = time();
$ip = $_SERVER['REMOTE_ADDR'];

if (! array_key_exists("ping", $_GET)) {
    $sql = "INSERT INTO `access_records` (`file`, `datetime`, `ip`, `uuid`) VALUES ( '$file',  $datetime , '$ip', '$uuid')";
    $conn->query($sql);
}

$sql = "SELECT COUNT(`file`) FROM `access_records` WHERE `file` LIKE '$file' ";
$result = $conn->query($sql);
$visits = $result->fetch_row()[0];

$sql = "SELECT COUNT(DISTINCT `uuid`) FROM `access_records` WHERE `file` LIKE '$file' ";
$result = $conn->query($sql);
$uvisits = $result->fetch_row()[0];


$sql = "SELECT COUNT(`file`) FROM `claps` WHERE `file` LIKE '$file' ";
$result = $conn->query($sql);
$claps = $result->fetch_row()[0];

$sql = "SELECT COUNT(DISTINCT `uuid`) FROM `claps` WHERE `file` LIKE '$file' ";
$result = $conn->query($sql);
$uclaps = $result->fetch_row()[0];

$sql = "SELECT COUNT(`uuid`) FROM `claps` WHERE `file` LIKE '$file' AND `uuid` LIKE '$uuid'";
$result = $conn->query($sql);
$uclapped = $result->fetch_row()[0];

header('Content-Type: application/json');
echo json_encode([
    'visits' => intval($visits),
    'unique_visits' => intval($uvisits),
    'claps' => intval($claps),
    'unique_claps' => intval($uclaps),
    'visitor_clapped' => (intval($uclapped) > 0)? true: false
]);


?>
