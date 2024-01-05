<?php
$F = $_FILES['file'];
if(!$F){
	fail('请上传文件');
}
if($F['error']){
	fail('文件上传失败('.$F['error'].')');
}

$file = $F['tmp_name'];
$new_file = md5_file($file).getExt($F['name']);
if(!move_uploaded_file($file, __DIR__.'/upload_tmp/'.$new_file)){
	fail('上传文件处理失败:'.error_get_last());
}

success([
	'value' => 'assets/upload_tmp/'.$new_file,
	'thumb' => 'assets/upload_tmp/'.$new_file,
	'name'  => $F['name'],
]);

function fail($err){
	echo json_encode(['error' => $err], JSON_UNESCAPED_UNICODE);
	exit;
}

function getExt($file_name){
	if(strpos($file_name, '.')){
		return strtolower(preg_replace('/.*(\.[^\.]+)$/', '$1', $file_name));
	}
	return '.jpg';
}

function success($data){
	echo json_encode($data, JSON_UNESCAPED_UNICODE);
	exit;
}
