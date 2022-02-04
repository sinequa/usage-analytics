// Useful Jenkins functions

// set the sba_version variable with the version
// the version is calculated or is a parameter of the job
def set_sba_version(curBranch) {
	if (sba_version.length() == 0) {
		if ( env.BRANCH_NAME.contains("release") ) {
			sba_version = curBranch.split("%2F")[1].trim()
		} else {
			sba_version = developNumber
		}
	}
	echo "sba_version: ${sba_version}"
}

// get the branch name and the version number from the right jenkins variable 
def findBranchNumber() {
	def tmpBranch=""
	def theBranch=""
	// PR : 
	//   BRANCH_NAME: PR-8208
	//   CHANGE_TARGET: release/11.7.0
	// BRANCH
	//   BRANCH_NAME: develop
	//   BRANCH_NAME: release/11.7.0
	// return: release%2F11.7.0

	echo "Triggering job for branch ${env.BRANCH_NAME}"
	if (env.BRANCH_NAME.contains("PR-")) {
		tmpBranch = env.CHANGE_TARGET
	} else {
		tmpBranch = env.BRANCH_NAME
	}
	echo "tmpBranch: ${tmpBranch}"

	theBranch = tmpBranch.replace("/", "%2F")
	echo "Branch returned: ${theBranch}"
	return theBranch
}

// function to check if we are in PR or another branch
def buildOrMerge() {
	def typeAction = ""
	if (env.BRANCH_NAME.contains("PR-")) {
		typeAction = "build"
	} else {
		typeAction = "merge"
	}
	return typeAction
}

// function to append lines to the end of a file
def appendFile(afile, what) {
	def content = ""
	def txt = ""
	try {
		if (fileExists(afile)) {
			content = readFile afile
			what.each {
				txt += it + "\n"
			}
			content += txt
			//echo "content: ${content}"
			writeFile file: afile, text: content
		}
	} catch (err) {
		currentBuild.result = "FAILURE"
		throw err
	}
}

// function to append lines to the end of a file
def ngAnalyticsOff() {
	def angularFile = "angular.json"
	def content = ""
	def txt = '\\{ "cli": \\{"analytics": false\\},'
	try {
		if (fileExists(angularFile)) {
			content = readFile angularFile
			content = content.replaceFirst("\\{", txt)
			//echo "content: ${content}"
			writeFile file: angularFile, text: content
		}
	} catch (err) {
		currentBuild.result = "FAILURE"
		throw err
	}
}

// function to update sinequa package version in package.json file
def updatePackage(version) {
	withEnv(["pkgVersion=${version}"]) {
		echo "pkgVersion = ${env.pkgVersion}"
		powershell ('''
			$file = 'package.json'
			write-host "Update: $file packages: @sinequa with pkgVersion: $env:pkgVersion"
			$regex1 = '\\"\\@sinequa/core\\".*'
			$regex2 = '\\"\\@sinequa/components\\".*'
			$regex3 = '\\"\\@sinequa/analytics\\".*'
			$s1 = '"@sinequa/core": "' + $env:pkgVersion + '",'
			$s2 = '"@sinequa/components": "' + $env:pkgVersion + '",'
			$s3 = '"@sinequa/analytics": "' + $env:pkgVersion + '",'
			(Get-Content $file) -replace $regex1, $s1 -replace $regex2, $s2 -replace $regex3, $s3 | Set-Content $file
			''')
	}
}

return this
