class CtaCrimeController < ApplicationController
  	def index
  		@data = CrimeEntry.getCrimeResults()
  		respond_to do |format|
  			format.html #index
  			# return either XML or JSON if receiving an AJAX request
  			format.xml { render :xml => @data }
  			format.json { render :json => @data }
  		end
  	end
end
