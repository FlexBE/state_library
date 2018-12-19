<?php
$origin = $_SERVER['HTTP_ORIGIN'];
$allowed_domains = [
    'https://flexbe.github.io',
];
if (in_array($origin, $allowed_domains)) {
    header('Access-Control-Allow-Origin: ' . $origin);
}
// header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

function getFilename($owner, $repo, $ref, $path)
{
    return 'cache/'.$owner.'__'.$repo.'__'.$ref.'__'.str_replace('/','_',$path).'.json';
}

function getContents($owner, $repo, $ref, $path)
{
    if (!file_exists(getFilename($owner, $repo, $ref, $path))) die(); 
    echo file_get_contents(getFilename($owner, $repo, $ref, $path));
}

function listCommits($owner, $repo, $ref, $path)
{
    
}

function setContents($owner, $repo, $ref, $path, $data)
{
    $cacheFile = fopen(getFilename($owner, $repo, $ref, $path), 'w') or die();
    fwrite($cacheFile, $data);
    fclose($cacheFile);
}

function setCommits($owner, $repo, $ref, $path, $data)
{

}


if(isset($_GET['cmd'])) {
    switch($_GET['cmd']) {
        case 'getContents':
            getContents($_GET['owner'], $_GET['repo'], $_GET['ref'], $_GET['path']);
            break;
        case 'listCommits':
            listCommits($_GET['owner'], $_GET['repo'], $_GET['ref'], $_GET['path']);
            break;
        default:
            break;
    }
}

if(isset($_POST['set'])) {
    switch($_POST['set']) {
        case 'setContents':
            setContents($_POST['owner'], $_POST['repo'], $_POST['ref'], $_POST['path'], $_POST['data']);
            break;
        case 'setCommits':
            setCommits($_POST['owner'], $_POST['repo'], $_POST['ref'], $_POST['path'], $_POST['data']);
            break;
        default:
            break;
    }
}

?>