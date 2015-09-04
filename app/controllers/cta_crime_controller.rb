class CtaCrimeController < ApplicationController
  	def index
  	end

  	def tally
      # Tally crime here
  		@tally = CrimeEntry.get_tally_breakdown()
  		respond_to do |format|
  			format.html #index
  			# return either XML or JSON if receiving an AJAX request
  			format.xml { render :xml => @tally }
  			format.json { render :json => @tally }
  		end
  	end

    def visualize
      @visualize = VisualizeMap.getData()
      respond_to do |format|
        format.html #index
        # return either XML or JSON if receiving an AJAX request
        format.xml { render :xml => @visualize }
        format.json { render :json => @visualize }
      end
    end
end
