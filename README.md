# Puzzle Driven Development recomendation system dataset

This repository contains the publicly released dataset for the upcoming paper "Issue Prioritization With Puzzle Driven
Development".

# Data format
The dataset is obtained using [Github Api](https://docs.github.com/en/rest). The whole dataset is stored in one file with json format. Each entity in the file representes [Github Issue](https://docs.github.com/en/issues).

The example of entity stored in the dataset is shown below 
```json
{
    "done": true,
    "comments": 1,
    "state": "closed",
    "closed_at": "2017-06-04T19:16:35Z",
    "created_at": "2017-06-03T20:31:23Z",
    "updated_at": "2017-06-04T19:16:35Z",
    "assignees": [
      {
        "login": ".....",
        "id": 2982959,
        "node_id": "MDQ6VXNlcjI5ODI5NTk=",
        "avatar_url": "https://avatars.githubusercontent.com/u/2982959?v=4",
        "gravatar_id": "",
      }
    ],
    "locked": false,
    "labels": [],
    "milestone": null,
    "author_association": "NONE",
    "referenced": 3,
    "labeled": 1,
    "assigned": 1,
    "closed": 1,
    "id": "70-5e01449d",
    "body": "The puzzle `70-5e01449d` in [`include/Result.h`](https://github.com/DronMDF/2out/blob/master/include/Result.h) (lines 20-20) has to be resolved: \"Implement ResSuite separately and live this class is abstract\"\n\nThe puzzle was created by Andrey Valyaev on 03-Jun-17. \n\nEstimate: 15 minutes, role: IMP.\n\nIf you have any technical questions, don't ask me, submit new tickets instead. The task will be \"done\" when the problem is fixed and the text of the puzzle is _removed_ from the source code. Here is more about [PDD](http://www.yegor256.com/2009/03/04/pdd.html) and [about me](http://www.yegor256.com/2017/04/05/pdd-in-action.html).",
    "file": "...",
    "role": "IMP",
    "time": "2017-06-03T20:31:18Z",
    "email": "...",
    "lines": "20-20",
    "owner": "DronMDF",
    "author": "...",
    "issueNo": "73",
    "estimate": "15",
    "ticketNo": "70",
    "issueLink": "https://github.com/DronMDF/2out/issues/73",
    "issueClosed": "2019-01-29T20:26:37+00:00",
    "title": "Result.h:20-20: Implement ResSuite separately and..."
  }
```
The detailed description of each field can be obtained via official guide [Github Issues API](https://docs.github.com/en/rest/issues/issues#get-an-issue). 

# Additional fields
The original work contains derived attributes, which are not presented in the dataset. This state of the dataset is meant to limit bias from our side and represent the original data without any preprocessing. Section 3 of the paper fully describes the way of deriving attributes, so we are encouraging interested researchers to derive them by themselves and compare them with the statistics shown in the same section,
