<?php

$servername = "localhost";
$username = "games";
$password = "Zw6L4@9x9Q2WoD8x";

try {
    $conn = new PDO("mysql:host=$servername;dbname=games", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection to database failed: " . $e->getMessage();
}

?>