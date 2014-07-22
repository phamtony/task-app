tasksController = function() {

  function errorLogger(errorCode, errorMessage) {
    console.log(errorCode + ':' + errorMessage);
  }

  function taskCountChanged() {
    var count = $(taskPage).find('#tblTasks tbody tr').length;
    $('footer').find('#taskCount').text(count);
  }

  function clearTask() {
    $(taskPage).find('form').fromObject({});
  }

  function renderTable() {
    $.each($(taskPage).find('#tblTasks tbody tr'), function(idx, row) {
      var due = Date.parse($(row).find('[datetime]').text());
      if(due.compareTo(Date.today()) < 0) {
        $(row).addClass("overdue");
      } else if (due.compareTo((2).days().fromNow()) <= 0) {
        $(row).addClass("warning");
      }
    });
  }

	var taskPage;
	var initialised = false;

	return {		
		init : function(page, callback) {
			if (initialised) {
        callback();
      } else {  
				taskPage = page;
        storageEngine.init(function() {
          storageEngine.initObjectStore('task', function() {
            callback();
          }, errorLogger)
        }, errorLogger);
				
				$(taskPage).find('[required="required"]').prev('label').append('<span>*</span>').children('span').addClass('required');
				$(taskPage).find('tbody tr:even').addClass('even');

				$(taskPage).find('#btnAddTask').click(function(evt) {
					evt.preventDefault();
					$(taskPage).find('#taskCreation').removeClass('not');
				});

        $(taskPage).find('#tblTasks tbody').on('click', 'tr', function(evt) {
          $(evt.target).closest('td').siblings().andSelf().toggleClass('rowHighlight');
        }); 

        //Clear task
        $(taskPage).find('#clearTask').click(function(evt) {
          evt.preventDefault();
          clearTask();
        });

        //Complete method
        $(taskPage).findById('task', $(evt.target).data().taskId, function(task) {
          storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
            task.complete = true;
            storageEngine.save('task',task, function() {
              tasksController.loadTasks();
            }, errorLogger);
          }, errorLogger);
        });

        //Edit method
        $(taskPage).find('#tblTasks tbody').on('click', '.editRow', function(evt) {
          $(taskPage).find('#taskCreation').removeClass('not');
          storageEngine.findById('task', $(evt.target).data().taskId, function(task) {
            $(taskPage).find('form').fromObject(task);
          }, errorLogger);
        });

        //Delete method
				$(taskPage).find('#tblTasks tbody').on('click', '.deleteRow', function(evt) { 
				  storageEngine.delete('task', $(evt.target).data().taskId, function() {
            $(evt.target).parents('tr').remove(); 
            taskCountChanged();
          }, errorLogger);
				});

        //Save method
				$(taskPage).find('#saveTask').click(function(evt) {
					evt.preventDefault();
					if ($(taskPage).find('form').valid()) {
						var task = $(taskPage).find('form').toObject();
            storageEngine.save('task', task, function() {
              $(taskPage).find('#tblTasks tbody').empty();
              tasksController.loadTasks();
              clearTask();
              $(taskPage).find('#taskCreation').addClass('not');
            }, errorLogger);
					}
				});

				initialised = true;										

			}
		},

    loadTasks : function() {
      storageEngine.findAll('task', function(tasks) {
        $.each(tasks, function(index, task) {
          $('#taskRow').tmpl(task).appendTo($(taskPage).find('#tblTasks tbody'));
        });
        taskCountChanged();
        renderTable();
      }, errorLogger);
    }

	}
}();