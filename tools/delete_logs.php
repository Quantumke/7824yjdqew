#!/usr/bin/php

<?php

	scan('/opt/');

	function scan($dir) {
		echo "Scanning $dir...\r\n";
		if ($handle = opendir($dir)) {
		    while (false !== ($entry = readdir($handle))) {
		        if ($entry != "." && $entry != ".." && $entry != "config" && $entry != "modules" && $entry != "node_modules") {
		        	$dirPath = $dir . $entry . "/";
		        	if (is_dir($dirPath)) {
		        		scan($dirPath);
		        	} else {
		        		$filePath = $dir . $entry;
		        		if ($entry === "server.log") {		        			
		        			truncate($filePath);
		        		} else {
		        			echo "Found file $filePath\r\n";
		        		}		        		
		        	}		           
		        }
		    }

		    closedir($handle);
		}
	}

	function truncate($filePath) {
		echo "Truncating file $filePath\r\n";
		if(false !== ($handle = fopen($filePath, "r+"))) {
			ftruncate($handle, 0);
			fclose($handle);
		}
	}

?>