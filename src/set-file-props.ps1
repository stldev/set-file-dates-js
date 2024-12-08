param($filedir='__none__', $filename='__none__', $propnumber=0, $debug=0, $setnewjpg=0, $filenamedate='__none__') 

$fullName = "$($filedir)\$($filename)"

$Shell = New-Object -ComObject shell.application

$dir = $Shell.Namespace($filedir)
$isDateTaken = ($dir.GetDetailsOf($dir.ParseName($filename), $propnumber) -replace '[^: \w\/]')

if ($debug -eq 1){
    Write-Host "propnumber: $($propnumber) | isDateTaken: $($isDateTaken) | fullName: $($fullName)";
}

if ($isDateTaken) {						
		
    $DateTaken = [DateTime]$isDateTaken		

    Set-ItemProperty -Path $fullName -Name CreationTime -Value $DateTaken	
    Set-ItemProperty -Path $fullName -Name LastWriteTime -Value $DateTaken	

    if ($setnewjpg -eq 1){
        $fullNameNewJpg =  $fullName.Replace(".heic", ".jpg");
        Set-ItemProperty -Path $fullNameNewJpg -Name CreationTime -Value $DateTaken	
        Set-ItemProperty -Path $fullNameNewJpg -Name LastWriteTime -Value $DateTaken	
    }

} else {

     if ($filenamedate -eq "__none__") {

        $dtModified = [DateTime](Get-ItemProperty $fullName -Name LastWriteTime).LastWriteTime
        $dtCreated = [DateTime](Get-ItemProperty $fullName -Name CreationTime).CreationTime

        if ($dtModified -lt $dtCreated) {  
            Set-ItemProperty -Path $fullName -Name CreationTime -Value $dtModified
            if ($setnewjpg -eq 1){
                $fullNameNewJpg =  $fullName.Replace(".heic", ".jpg");
                Set-ItemProperty -Path $fullNameNewJpg -Name CreationTime -Value $dtModified
            }
        }

        if ($dtCreated -lt $dtModified) { 
            Set-ItemProperty -Path $fullName -Name LastWriteTime -Value $dtCreated
            if ($setnewjpg -eq 1){
                $fullNameNewJpg =  $fullName.Replace(".heic", ".jpg");
                Set-ItemProperty -Path $fullNameNewJpg -Name LastWriteTime -Value $dtCreated
            }
        }

     } else {
        $fileNameDateTime = [DateTime]$filenamedate
        Set-ItemProperty -Path $fullName -Name CreationTime -Value $fileNameDateTime
        Set-ItemProperty -Path $fullName -Name LastWriteTime -Value $fileNameDateTime
     }
    
}

