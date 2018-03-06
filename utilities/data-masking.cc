/**
 * Data Masking (数据脱敏)
 *
 *   This cpp utilities is used for generate some mock data for test from real data.
 *     and this utilities will mask some privacy data (name of project, path ...) in real file
 *
 *   Compile: (please prepare a cpp compiler such as `g++` or `clang`)
 * 		g++ -std=c++11 -O2 -Wall data-masking.cc -o data-masking.out
 *   Run:
 *      ./data-masking.out <target folder> <files....>
 *   Example Run: (generate mock data from all tracked data in 2018)
 *      ./data-masking.out ../test/resources/mock-data ~/.coding-tracker/18*.db
 */

#include<iostream>
#include<fstream>
#include<string>
#include<sstream>
#include<map>
#include<vector>
#include<set>
#include<regex>

#include<stdio.h>
#include<stdlib.h>
#include<string.h>
#include<stdarg.h>
#include<time.h>

using namespace std;

const char* OUT_NAME = "./data-masking.out";
const unsigned BUFFER_SIZE = 1024;
char buffer[BUFFER_SIZE];


vector<string> readTextLinesInFile(const string& filePath);

string getExtNameFromFilePath(const string& filePath);
string getDirPathFromFilePath(const string& filePath);
string getFileNameFromFilePath(const string& filePath);
string joinPath(string dir, string file);

string encodeURIComponent(const string &plain);
string decodeURIComponent(string encrypted);

bool shell(const char* format, ...);
string shellEscape(const string& str);

void _num2hex(unsigned char num, char* write2);
unsigned char _hex2num(const char* readFrom);

bool endsWith(const string &main, const string &end);
bool startsWith(const string &main, const string &prefix);
vector<string> split(const string& s, char sep);

template<typename T>
void printSTL(const string& name, T stl, const string& indent = "");


class DataItem {
public:
	unsigned type;
	string timestamp;
	string howLong;
	string language;
	string filePath;
	string projectPath;
	string computerId;
	string vcs;
	string l, c ,r1, r2;
	explicit DataItem(const string& line) {
		stringstream ss(line);
		ss >> type >> timestamp >> howLong >> language >> filePath
			>> projectPath >> computerId >> vcs >> l >> c >> r1 >> r2;
		language = decodeURIComponent(language);
		filePath = decodeURIComponent(filePath);
		projectPath = decodeURIComponent(projectPath);
		computerId = decodeURIComponent(computerId);
	}
	string toString() {
		stringstream ss;
		ss << type << " " << timestamp << " " << howLong << " "
			<< encodeURIComponent(language) << " "
			<< encodeURIComponent(filePath) << " "
			<< encodeURIComponent(projectPath) << " "
			<< encodeURIComponent(computerId) << " "
			<< vcs << " " << l << " " << c << " " << r1 << " " << r2;
		return ss.str();
	}
};

// =============================================
// ignore this item if empty string returned by mask function

set<string> validProjectName = {
	"chrome-steam-helper", "my-backup-helper",
	"steam-key-online-redeem", "cpp-how-to-use-libclang",
	"vscode-coding-tracker", "vscode-coding-tracker-server",
	"vscode-nginx-conf-hint", "mdjs"
};
string getProjectMask(const string& project) {
//	return project; // for list all projects
	string name = getFileNameFromFilePath(project);
	if(validProjectName.find(name) == validProjectName.end())
		return "";
	return joinPath("/projects/", name);
}

string getFileMask(const string& file) {
	if(file[0] != '/')
		return file; // it is file in the folder of project
	string ext = getExtNameFromFilePath(file);
	if(ext.empty()) return ""; // skip it
	return joinPath("/single_files/", "file." + ext);
}

string getVCSMask(const string& vcs) {
	if(vcs == "::" || startsWith(vcs, "git::")) return vcs;
	vector<string> part = split(vcs, ':');
	string vcsPath = decodeURIComponent(part[1]);

	if(vcsPath.empty()) return vcs;
	if(vcsPath[0] != '/') return vcs; // vcs in sub-folder

	vcsPath = getProjectMask(vcsPath);
	return part[0] + ":" + vcsPath + ":" + part[2];
}
// =============================================

int _main(int argc, char* argv[]);
int main(int argc, char* argv[]) {
	struct timespec t0, t1;
	clock_gettime(CLOCK_REALTIME, &t0);
	int code = _main(argc, argv);
	clock_gettime(CLOCK_REALTIME, &t1);
	printf("[EXIT] code: %d (%.1lf ms elapsed)\n", code,
		(double)((t1.tv_sec - t0.tv_sec) * 1000 + (t1.tv_nsec - t0.tv_nsec) * 0.001 * 0.001));
	return code;
}
int _main(int argc, char* argv[]) {
	if(argc <= 2) {
		printf("\n  usage: %s <target folder> <files...>\n\n", OUT_NAME);
		return 1;
	}

	string targetFolder(argv[1]);
	vector<string> files;
	for(int i = 2 ; i < argc ; i ++ )
		files.emplace_back(string(argv[i]));

	printf("[INFO] Target folder:\t\"%s\"\n", targetFolder.c_str());
	printf("[INFO] Files count:\t%zu\n", files.size());

	if(!shell("test -d %s", shellEscape(targetFolder).c_str())) {
		if(!shell("mkdir -p %s", shellEscape(targetFolder).c_str())) {
			fprintf(stderr, "[ERROR] Could not create target folder: \"%s\"\n", targetFolder.c_str());
			return 1;
		}
		printf("[INFO] Created target folder: \"%s\"\n", targetFolder.c_str());
	}

	set<string> allProjects;
	set<string> allFiles;
	set<string> allVCS;

	unsigned newFiles = 0;

	for(const string& filePath: files) {
		string fileName = getFileNameFromFilePath(filePath);
		string targetFilePath = joinPath(targetFolder, fileName);
		if(fileName.empty()) {
			fprintf(stderr, "[ERROR] Empty file name of file path: \"%s\"\n", filePath.c_str());
			return 1;
		}

		vector<string> lines = readTextLinesInFile(filePath);
		vector<string> newLines;
		if(lines.empty()) {
			fprintf(stderr, "[ERROR] Empty content of file: \"%s\"\n", fileName.c_str());
			return 1;
		}

		if(lines[0] != "4.0") {
			fprintf(stderr, "[ERROR] Incompatible verion of file: \"%s\"\n", fileName.c_str());
			fprintf(stderr, "          Expected version: 4.0 But actual: %s\n", lines[0].c_str());
			return 1;
		}

		newLines.push_back("4.0");

		unsigned lineNo = 0;
		for(auto line: lines) {
			if(++lineNo == 1) continue;

			DataItem item(line);
			item.projectPath = getProjectMask(item.projectPath);
			item.filePath = getFileMask(item.filePath);
			item.vcs = getVCSMask(item.vcs);

			// if this item is ignorable
			if(item.projectPath.empty() || item.filePath.empty() || item.vcs.empty())
				continue;

			allProjects.insert(item.projectPath);
			allFiles.insert(item.filePath);
			allVCS.insert(item.vcs);

			newLines.push_back(item.toString());
		}

		size_t items = newLines.size() - 1;
		bool isEmpty = items == 0;
		printf("[INFO] %zu\titems after masked in %s%s\n", items, fileName.c_str(),
			(isEmpty ? " (Ignore)" : "") );
		if(isEmpty)
			continue;

		ofstream fout;
		fout.open(targetFilePath);
		for(const auto& line: newLines)
			fout << line << endl;
		fout.flush();
		fout.close();

		newFiles++;
	}

	printf("\n[INFO] generated %u files from %zu files\n", newFiles, files.size());

//	printSTL("All Projetcs", allProjects);
//	printSTL("All Files", allFiles);
//	printSTL("All VCS", allVCS);

	return 0;
}

// ====================================
//         F u n c t i o n s
// =====================================

vector<string> readTextLinesInFile(const string& filePath) {
	vector<string> lines;

	FILE *fp = fopen(filePath.c_str(), "rb");
	if(fp == nullptr)
		return lines;
	fseek(fp, 0, SEEK_END);

	size_t size = (size_t) ftell(fp);
	char* content = (char*) malloc(size + 1);
	rewind(fp);
	size_t realSize = fread(content, 1, size, fp);
	if(realSize != size) {
		fprintf(stderr, "[ERROR] Read %s failed! (expected size: %zu, but actual size: %zu)\n",
			filePath.c_str(), size, realSize);
		return lines;
	}

	content[size] = '\0';
	fclose(fp);

	stringstream ss(content);
	string line;
	while(getline(ss, line, '\n'))
		lines.push_back(line);

	free(content);
	return lines;
}

string getExtNameFromFilePath(const string& filePath) {
	int index = filePath.length() - 1;
	for( ; index >= 0 ; index -- ) {
		char ch = filePath[index];
		if(ch == '.')
			return string(filePath.c_str() + index + 1);
		if(ch == '/')
			break;
	}
	return "";
}
string getDirPathFromFilePath(const string& filePath) {
	int index = filePath.length() - 1;
	for( ; index >= 0 ; index-- )
		if(filePath[index] == '/')
			filePath.substr(0, index);
	return "";
}
string getFileNameFromFilePath(const string& filePath) {
	int index = filePath.length() - 1;
	for( ; index >= 0 ; index-- )
		if(filePath[index] == '/')
			break;
	return string(filePath.c_str() + index + 1);
}
string joinPath(string dir, string file) {
	if(dir.back() == '/') dir.pop_back();
	if(file.front() == '/') file.erase(0, 1);
	return dir + "/" + file;
}

bool shell(const char* format, ...) {
	va_list va;
	va_start(va, format);
	vsnprintf(buffer, BUFFER_SIZE, format, va);
	va_end(va);
	return system(buffer) == 0;
}
string shellEscape(const string& str) {
	const char* r = str.c_str();
	char* w = buffer;
	*w++ = '\'';
	while(*r) {
		char ch = *r++;
		if(ch == '\'') { strcpy(w, "'\\''"); w+=4; }
		else *w++ = ch;
	}
	*w++ = '\''; *w = '\0';
	return buffer;
}

void _num2hex(unsigned char num, char* write2) {
	unsigned char c0 = num >> 4;
	unsigned char c1 = num & 0xf;
	*(write2+0) = (c0 >= 10) ? (c0 - 10 + 'A') : (c0 + '0');
	*(write2+1) = (c1 >= 10) ? (c1 - 10 + 'A') : (c1 + '0');
}
unsigned char _hex2num(const char* readFrom) {
	unsigned char r = 0;
	char c = *readFrom;
	if(c >= '0' && c <= '9') r = (c - '0') << 4;
	else if(c >= 'A' && c <= 'F') r = (c - 'A' + 10) << 4;
	else if(c >= 'a' && c <= 'f') r = (c - 'a' + 10) << 4;

	c = *(readFrom+1);
	if(c >= '0' && c <= '9') r += (c - '0');
	else if(c >= 'A' && c <= 'F') r += (c - 'A' + 10);
	else if(c >= 'a' && c <= 'f') r += (c - 'a' + 10);

	return r;
}

string encodeURIComponent(const string& plain) {
	char* str = (char*) malloc(plain.size() * 3 + 1);
	const char* reader = plain.c_str();
	char* writer = str;
	while(*reader) {
		char c = *reader++;

		if(c >= '0' && c <= '9') *writer++ = c;
		else if(c >= 'A' && c <= 'Z') *writer++ = c;
		else if(c >= 'a' && c <= 'z') *writer++ = c;
		else if(c == '(' || c == ')' || c == '.' || c == '!' ||
			c == '~' || c == '*' || c == '\'' || c == '-' || c == '_') *writer++ = c;
		else {
			*writer++ = '%';
			_num2hex((unsigned char) c, writer);
			writer += 2;
		}
	}
	*writer = '\0';
	string result = str;
	free(str);
	return result;
}

string decodeURIComponent(string encrypted) {
	char* str = (char*) malloc(encrypted.size() + 1);
	const char* reader = encrypted.c_str();
	char* writer = str;
	while(*reader) {
		char c = *reader++;
		if(c == '%' && *reader && *(reader+1)) { // current is % and still has two char following
			*writer++ = (char) _hex2num(reader);
			reader += 2;
		} else {
			*writer++ = c;
		}
	}
	*writer = '\0';
	string result = str;
	free(str);
	return result;
}

template<typename T>
void printSTL(const string& name, T stl, const string& indent) {
	cout << indent << "`" << name << "` (size: " << stl.size() << ") {\n";
	for(const auto& it: stl)
		cout << indent << "  `" << it << "`\n";
	cout << indent << "}\n";
}

bool endsWith(const string& main, const string& end) {
	if(main.length() < end.length()) return false;
	return memcmp(main.c_str() + main.length() - end.length(), end.c_str(), end.length()) == 0;
}
bool startsWith(const string& main, const string& prefix) {
	if(main.length() < prefix.length()) return false;
	return memcmp(main.c_str(), prefix.c_str(), prefix.length()) == 0;
}

vector<string> split(const string& s, char sep) {
	stringstream ss(s);
	string item;
	vector<string> result;
	while(getline(ss, item, sep))
		result.push_back(item);
	return result;
}
