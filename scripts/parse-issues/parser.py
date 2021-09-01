import json
import requests
import os
import logging

logging.basicConfig()
token = os.getenv('GITHUB_TOKEN', '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')
query_url = f"https://api.github.com/repos/"
headers = {'Authorization': f'token {token}'}


def write_json(new_data, filename='all-issues.json'):
    with open(filename, 'r+') as jsonFile:
        file_data = json.load(jsonFile)
        file_data["issues"].append(new_data)
        jsonFile.seek(0)
        json.dump(file_data, jsonFile, indent=4)

def extendUrlsData(url):
    data = requests.get(url, headers=headers).json()
    return data

def extend(field, filename='all-issues.json'):
    with open(filename, 'r+') as jsonFile:
        file_data = json.load(jsonFile)
        for i in file_data['issues']:
            try:
                print('Previous  ',i[field])
                i[field] = extendUrlsData(i[field])
                print('Current  ', i[field])
            except Exception:
                print('Failed. Some error occured.')
        jsonFile.seek(0)
        json.dump(file_data, jsonFile, indent=4)

def getIssuesData():
    countLost = 0
    countCollected = 0
    with open('all-puzzles.json') as f:
        data = json.load(f)
    for i in data:
        # noinspection PyBroadException
        try:
            issueLink = i['issueLink'].replace('https://github.com/', query_url, 1)
            r = requests.get(issueLink, headers=headers).json()
            countCollected = countCollected + 1
            write_json(r)
        except Exception:
            countLost = countLost + 1
            print('Failed. Puzzle does not contain issue link.')

# extend_comments()
# print('Total issues ', countLost + countCollected)
# print('Issues with link ', countCollected)
# print('Puzzles without link ', countLost)
extend('events_url')
extend('labels_url')
