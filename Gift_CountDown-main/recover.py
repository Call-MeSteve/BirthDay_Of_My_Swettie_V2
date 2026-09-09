import re
import json

log_path = r"C:\Users\PC\.gemini\antigravity\brain\35b42dfd-3156-4b0b-9702-d44fb33acc39\.system_generated\logs\transcript_full.jsonl"
recovered_lines = {}

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            # Find any text block that might be view_file output
            text = json.dumps(data) 
            # We can also just traverse the dict, but string matching is easier:
            # The view_file output is literal text with "\n1040: ..."
            # But let's just parse the json and look for string values
            def find_strings(d):
                if isinstance(d, dict):
                    for v in d.values():
                        find_strings(v)
                elif isinstance(d, list):
                    for v in d:
                        find_strings(v)
                elif isinstance(d, str):
                    for match in re.finditer(r'^(\d+): (.*)$', d, re.MULTILINE):
                        recovered_lines[int(match.group(1))] = match.group(2)
            find_strings(data)
        except Exception as e:
            pass

with open('recovered.js', 'w', encoding='utf-8') as out:
    for i in range(989, 1981):
        if i in recovered_lines:
            out.write(recovered_lines[i] + "\n")
        else:
            out.write(f"// MISSING LINE {i}\n")
print(f"Recovered {len(recovered_lines)} lines.")
