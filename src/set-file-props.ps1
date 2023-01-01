param($filedir='__missing__', $filename='__missing__', $propnumber=0, $debug=0) 

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

} else {
		    
    $dtModified = [DateTime](Get-ItemProperty $fullName -Name LastWriteTime).LastWriteTime
    $dtCreated = [DateTime](Get-ItemProperty $fullName -Name CreationTime).CreationTime

    if ($dtModified -lt $dtCreated) {  
        Set-ItemProperty -Path $fullName -Name CreationTime -Value $dtModified
    }
    
    if ($dtCreated -lt $dtModified) { 
        Set-ItemProperty -Path $fullName -Name LastWriteTime -Value $dtCreated
    }
    
}

