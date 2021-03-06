﻿define(['entities/course',
    'entities/Objective',
    'entities/Multipleselect',
    'entities/FillInTheBlanks',
    'entities/DragAndDrop',
    'entities/Singleselect',
    'entities/SingleselectImage',
    'entities/TextMatching',
    'entities/Statement',
    'entities/Hotspot',

     'Q',
     '_',
     'plugins/http'],

     function (course, Objective, Multipleselect, FillInTheBlanks, DragAndDrop, Singleselect, SingleselectImage, TextMatching, Statement, Hotspot, Q, _, http) {
         "use strict";

         return {
             initialize: initialize
         };

         function initialize() {
             var dfd = Q.defer();

             $.ajax({
                 url: 'content/data.js',
                 contentType: 'application/json',
                 dataType: 'json',
                 cache: false
             }).done(function (response) {

                 var promises = [];

                 course.id = response.id;
                 course.title = response.title;

                 _.each(response.objectives, function (dobj) {
                     var objective = new Objective(dobj.id, dobj.title);

                     _.each(dobj.questions, function (dq) {
                         var question;

                         switch (dq.type) {
                             case "multipleSelect":
                                 question = new Multipleselect(dq.id, dq.title, dq.answers);
                                 break;
                             case "fillInTheBlank":
                                 var answers = [];
                                 _.each(dq.answerGroups, function (group) {
                                     _.each(group.answers, function (answer) {
                                         if (answer.isCorrect) {
                                             answers.push({
                                                 id: answer.id,
                                                 groupId: group.id,
                                                 text: answer.text
                                             });
                                         }
                                     });
                                 });
                                 question = new FillInTheBlanks(dq.id, dq.title, answers);
                                 break;
                             case "dragAndDropText":
                                 question = new DragAndDrop(dq.id, dq.title, dq.background, dq.dropspots);
                                 break;
                             case "singleSelectText":
                                 question = new Singleselect(dq.id, dq.title, dq.answers);
                                 break;
                             case "singleSelectImage":
                                 question = new SingleselectImage(dq.id, dq.title, dq.answers, dq.correctAnswerId);
                                 break;
                             case "textMatching":
                                 question = new TextMatching(dq.id, dq.title, dq.answers, dq.correctAnswerId);
                                 break;
                             case "statement":
                                 question = new Statement(dq.id, dq.title, dq.answers);
                                 break;
                             case "hotspot":
                                 question = new Hotspot(dq.id, dq.title, dq.isMultiple, dq.background, dq.spots);
                                 break;
                             default:
                                 return undefined;
                         }

                         if (dq.hasContent) {
                             promises.push(http.get('content/' + dobj.id + '/' + dq.id + '/content.html', { dataType: 'html' }).then(function (content) {
                                 question.content = content;
                             }));
                         }

                         if (dq.hasCorrectFeedback) {
                             question.correctFeedback = 'content/' + dobj.id + '/' + dq.id + '/correctFeedback.html';
                         }

                         if (dq.hasIncorrectFeedback) {
                             question.incorrectFeedback = 'content/' + dobj.id + '/' + dq.id + '/incorrectFeedback.html';
                         }

                         question.learningContents = _.map(dq.learningContents, function (item) {
                             return 'content/' + dobj.id + '/' + dq.id + '/' + item.id + '.html';
                         });

                         objective.questions.push(question);
                     });

                     if (objective.questions && objective.questions.length) {
                         course.objectives.push(objective);
                     }
                 });

                 if (response.hasIntroductionContent) {
                     promises.push(http.get('content/content.html', { dataType: 'html' }).then(function (content) {
                         course.content = content;
                     }));
                 }

                 Q.allSettled(promises).then(function () {
                     dfd.resolve();
                 }).catch(function (reason) {
                     dfd.reject(reason);
                 });

             });

             return dfd.promise;
         }

     });