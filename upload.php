<?php

$uploaddir = dirname ( __FILE__ )."/img/";
$uploadfile = $uploaddir . "avatar.jpg";

echo '<img src="'.$_FILES['image-file']['tmp_name'].'">';
echo '<pre>';
if (move_uploaded_file($_FILES['image-file']['tmp_name'], $uploadfile)) {
    echo "Le fichier est valide, et a été téléchargé avec succès. Voici plus d'informations :\n";
} else {
	if (rename($_FILES['image-file']['tmp_name'], $uploadfile)) 
   		 echo "Le fichier est valide, et a été téléchargé avec succès. Voici plus d'informations :\n";
	else
   		 echo "ERROR: $uploadfile <br>Voici plus d'informations :\n";
}

echo 'Voici quelques informations de débogage :';
print_r($_FILES);

echo '</pre>';

?>
