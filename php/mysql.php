<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2016/3/27
 * Time: 14:42
 */

$hostname="localhost";
$basename="root";
$basepass="";
$database="findmovie";
$conn=mysqli_connect($hostname,$basename,$basepass,$database);
mysqli_query($conn,"SET NAMES 'UTF8'");
mysqli_query($conn,"SET CHARACTER SET UTF8");
mysqli_query($conn,"SET CHARACTER_SET_RESULTS=UTF8'");