<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $db = new mysqli($_POST['host'], $_POST['user'], $_POST['pass'], $_POST['name']);
    if ($db->connect_errno) die("DB connect failed: ".$db->connect_error);
    $db->query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(128), pass VARCHAR(128))");
    echo "DB initialized! <a href='/'>Go to dashboard</a>";
    exit;
}
?>
<!DOCTYPE html><html><body>
<h3>Trade OS Installer</h3>
<form method="post">
  Host: <input name="host" value="localhost"><br>
  User: <input name="user"><br>
  Pass: <input name="pass" type="password"><br>
  DB Name: <input name="name"><br>
  <button>Install</button>
</form>
</body></html>
