<?php
var_dump($_REQUEST, $_POST, $_GET);die;
echo json_encode([
	'code'    => 0,
	'message' => 'success',
	'data'    => [
		'request' => $_REQUEST,
		'post'    => $_POST,
		'get'     => $_GET,
	],
]);
