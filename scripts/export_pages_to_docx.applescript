set sourceFolder to POSIX file "/Users/anastasiasmirnova/Documents/sansara-research-journal/articles" as alias
set outputFolder to "/Users/anastasiasmirnova/Documents/sansara-research-journal/articles/readable/docx/"
set logPath to "/Users/anastasiasmirnova/Documents/sansara-research-journal/articles/extraction-audit/pages-export.log"

on replaceText(sourceText, searchText, replacementText)
	set AppleScript's text item delimiters to searchText
	set textItems to text items of sourceText
	set AppleScript's text item delimiters to replacementText
	set cleanedText to textItems as text
	set AppleScript's text item delimiters to ""
	return cleanedText
end replaceText

on safeBaseName(sourceText)
	set cleanedText to my replaceText(sourceText, ":", " -")
	set cleanedText to my replaceText(cleanedText, "/", " -")
	return cleanedText
end safeBaseName

do shell script "printf '' > " & quoted form of logPath

tell application "Finder"
	set pageFiles to every file of sourceFolder whose name extension is "pages"
end tell

tell application "Pages"
	repeat with pageFile in pageFiles
		set fileName to "unknown"
		try
			set sourceAlias to pageFile as alias
			set sourcePath to POSIX path of sourceAlias
			set fileName to name of (info for sourceAlias)
			if fileName ends with ".pages" then
				set baseName to text 1 thru -7 of fileName
			else
				set baseName to fileName
			end if
			set baseName to my safeBaseName(baseName)
			set outputPath to outputFolder & baseName & ".docx"
			open sourceAlias
			delay 0.4
			set theDoc to front document
			export theDoc to POSIX file outputPath as Microsoft Word
			close theDoc saving no
			do shell script "printf '%s\\n' " & quoted form of ("OK	" & fileName & "	" & outputPath) & " >> " & quoted form of logPath
		on error errorMessage number errorNumber
			do shell script "printf '%s\\n' " & quoted form of ("ERROR	" & fileName & "	" & errorNumber & "	" & errorMessage) & " >> " & quoted form of logPath
			try
				close front document saving no
			end try
		end try
	end repeat
end tell
